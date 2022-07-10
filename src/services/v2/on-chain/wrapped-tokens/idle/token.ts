import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { currentBalance } from '@/services/chain/erc20/balance';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { EstimateResponse } from '@/services/v2/on-chain/mover';
import { WrappedToken } from '@/services/v2/on-chain/wrapped-tokens/WrappedToken';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import {
  convertToString,
  floorDivide,
  fromWei,
  multiply,
  sub,
  toWei
} from '@/utils/bigmath';
import { InMemoryCache } from '@/utils/cache';
import { Network } from '@/utils/networkTypes';
import { IDLE_TOKEN_ABI } from '@/wallet/references/data';
import {
  getIdleTokenByAddress,
  WrapTokenData
} from '@/wallet/references/idleTokensData';
import { SmallToken, SmallTokenInfo, TransactionsParams } from '@/wallet/types';

export class WrappedTokenIdle extends WrappedToken {
  readonly sentryCategoryPrefix: string;
  private readonly wrapTokenData: WrapTokenData;
  private readonly multiplierCache: InMemoryCache<string>;

  constructor(
    wrappedAssetAddress: string,
    network: Network,
    web3: Web3,
    accountAddress: string
  ) {
    super(network, web3, accountAddress);
    const idleToken = getIdleTokenByAddress(wrappedAssetAddress, network);
    if (idleToken === undefined) {
      throw new Error(
        `Can't find idle token by address: ${wrappedAssetAddress}`
      );
    }
    this.wrapTokenData = idleToken;
    this.sentryCategoryPrefix = `wrapped-token.idle-token.${this.wrapTokenData.wrapToken.symbol}`;

    this.multiplierCache = new InMemoryCache<string>(
      5 * 60,
      this.getMultiplier
    );
  }

  getUnwrappedToken = (): SmallTokenInfo => this.wrapTokenData.commonToken;

  canHandle(assetAddress: string, network: Network): boolean {
    return (
      network === this.network &&
      sameAddress(this.wrapTokenData.wrapToken.address, assetAddress)
    );
  }

  public async getUnwrappedAmount(wrappedTokenAmount: string): Promise<string> {
    const mul = await this.multiplierCache.get();
    return multiply(wrappedTokenAmount, mul);
  }

  async estimateUnwrap(
    inputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<EstimateResponse> {
    const contractABI = IDLE_TOKEN_ABI;

    try {
      const contract = new this.web3.eth.Contract(
        contractABI as AbiItem[],
        this.wrapTokenData.wrapToken.address
      );

      const transactionParams = {
        from: this.accountAddress
      } as TransactionsParams;

      const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

      addSentryBreadcrumb({
        type: 'info',
        category: `${this.sentryCategoryPrefix}.estimate-unwrap`,
        message: 'input amount in WEI',
        data: {
          inputAmountInWEI,
          idleName: this.wrapTokenData.name,
          idleAddress: this.wrapTokenData.wrapToken.address,
          idleCommonToken: this.wrapTokenData.commonToken.address
        }
      });

      addSentryBreadcrumb({
        type: 'info',
        category: `${this.sentryCategoryPrefix}.estimate-unwrap`,
        message: 'transaction params',
        data: {
          ...transactionParams
        }
      });

      const gasLimitObj = await (
        contract.methods.withdraw(inputAmountInWEI) as ContractSendMethod
      ).estimateGas(transactionParams);

      if (gasLimitObj) {
        const gasLimit = gasLimitObj.toString();
        const gasLimitWithBuffer = floorDivide(
          multiply(gasLimit, '120'),
          '100'
        );

        addSentryBreadcrumb({
          type: 'info',
          category: `${this.sentryCategoryPrefix}.estimate-unwrap`,
          message: 'gas estimations',
          data: {
            gasLimit,
            gasLimitWithBuffer
          }
        });

        return { error: false, gasLimit: gasLimitWithBuffer };
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: `${this.sentryCategoryPrefix}.estimate-unwrap`,
        message: 'failed to estimate top up',
        data: {
          error
        }
      });

      throw new OnChainServiceError(
        'Failed to estimate simple yearn vault unwrap'
      ).wrap(error);
    }

    throw new OnChainServiceError(
      'Failed to estimate simple yearn vault unwrap: empty gas limit'
    );
  }

  async unwrap(
    inputAsset: SmallToken,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<string> {
    const balanceBeforeUnwrap = await currentBalance(
      this.web3,
      this.accountAddress,
      this.wrapTokenData.commonToken.address
    );

    await this._unwrap(inputAsset, inputAmount, changeStepToProcess, gasLimit);

    const balanceAfterUnwrap = await currentBalance(
      this.web3,
      this.accountAddress,
      this.wrapTokenData.commonToken.address
    );

    return sub(balanceAfterUnwrap, balanceBeforeUnwrap);
  }

  private async _unwrap(
    inputAsset: SmallToken,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    const contractABI = IDLE_TOKEN_ABI;

    const contract = new this.web3.eth.Contract(
      contractABI as AbiItem[],
      this.wrapTokenData.wrapToken.address
    );

    const transactionParams = {
      from: this.accountAddress,
      gas: this.web3.utils.toBN(gasLimit).toNumber(),
      gasPrice: undefined,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    } as TransactionsParams;

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    addSentryBreadcrumb({
      type: 'info',
      category: `${this.sentryCategoryPrefix}.execute-unwrap`,
      message: 'input amount in WEI',
      data: {
        inputAmountInWEI,
        idleName: this.wrapTokenData.name,
        idleAddress: this.wrapTokenData.wrapToken.address,
        idleCommonToken: this.wrapTokenData.commonToken.address
      }
    });

    addSentryBreadcrumb({
      type: 'info',
      category: `${this.sentryCategoryPrefix}.estimate-unwrap`,
      message: 'transaction params',
      data: {
        ...transactionParams
      }
    });

    addSentryBreadcrumb({
      type: 'info',
      category: `${this.sentryCategoryPrefix}.estimate-unwrap`,
      message: 'currency'
    });

    return new Promise<TransactionReceipt>((resolve, reject) => {
      this.wrapWithSendMethodCallbacks(
        (
          contract.methods.withdraw(inputAmountInWEI) as ContractSendMethod
        ).send(transactionParams),
        resolve,
        reject,
        changeStepToProcess
      );

      return;
    });
  }

  private async getMultiplier(): Promise<string> {
    const contract = new this.web3.eth.Contract(
      IDLE_TOKEN_ABI as AbiItem[],
      this.wrapTokenData.wrapToken.address
    );

    const multiplier = await (
      contract.methods.tokenPriceWithFee(
        this.accountAddress
      ) as ContractSendMethod
    ).call({
      from: this.accountAddress
    });

    const multiplierInWei = convertToString(multiplier);

    return fromWei(multiplierInWei, this.wrapTokenData.wrapToken.decimals);
  }
}
