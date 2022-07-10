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
  multiply,
  sub,
  toWei
} from '@/utils/bigmath';
import { InMemoryCache } from '@/utils/cache';
import { Network } from '@/utils/networkTypes';
import {
  getBTRFLYAssetData,
  lookupAddress,
  WX_BTRFLY_ABI
} from '@/wallet/references/data';
import { SmallToken, SmallTokenInfo, TransactionsParams } from '@/wallet/types';

export class WrappedTokenWXBTRFLY extends WrappedToken {
  readonly sentryCategoryPrefix: string;
  public readonly wrappedTokenAddress: string;
  public readonly unwrappedTokenAddress: string;
  public readonly contractABI = WX_BTRFLY_ABI;
  private readonly multiplierCache: InMemoryCache<string>;

  constructor(network: Network, web3: Web3, accountAddress: string) {
    super(network, web3, accountAddress);
    this.sentryCategoryPrefix = `wrapped-token.wx-btrfl`;
    this.wrappedTokenAddress = lookupAddress(
      network,
      'WX_BTRFLY_TOKEN_ADDRESS'
    );
    this.unwrappedTokenAddress = lookupAddress(network, 'BTRFLY_TOKEN_ADDRESS');

    this.multiplierCache = new InMemoryCache<string>(5 * 60, this.getRealIndex);
  }

  public getUnwrappedToken(): SmallTokenInfo {
    return getBTRFLYAssetData(this.network);
  }

  public canHandle(assetAddress: string, network: Network): boolean {
    return (
      network === this.network &&
      sameAddress(this.wrappedTokenAddress, assetAddress)
    );
  }

  public async getUnwrappedAmount(wrappedTokenAmount: string): Promise<string> {
    const mul = await this.multiplierCache.get();
    return multiply(wrappedTokenAmount, mul);
  }

  public async estimateUnwrap(
    inputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<EstimateResponse> {
    try {
      const contract = new this.web3.eth.Contract(
        this.contractABI as AbiItem[],
        this.wrappedTokenAddress
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
          inputAmountInWEI
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
        contract.methods.unwrapToBTRFLY(inputAmountInWEI) as ContractSendMethod
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

      throw new OnChainServiceError('Failed to estimate unwrap').wrap(error);
    }

    throw new OnChainServiceError('Failed to estimate unwrap: empty gas limit');
  }

  public async unwrap(
    inputAsset: SmallToken,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<string> {
    const balanceBeforeUnwrap = await currentBalance(
      this.web3,
      this.accountAddress,
      this.unwrappedTokenAddress
    );

    await this._unwrap(inputAsset, inputAmount, changeStepToProcess, gasLimit);

    const balanceAfterUnwrap = await currentBalance(
      this.web3,
      this.accountAddress,
      this.unwrappedTokenAddress
    );

    return sub(balanceAfterUnwrap, balanceBeforeUnwrap);
  }

  protected async _unwrap(
    inputAsset: SmallToken,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(
      this.contractABI as AbiItem[],
      this.wrappedTokenAddress
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
        inputAmountInWEI
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
          contract.methods.unwrapToBTRFLY(
            inputAmountInWEI
          ) as ContractSendMethod
        ).send(transactionParams),
        resolve,
        reject,
        changeStepToProcess
      );

      return;
    });
  }

  private async getRealIndex(): Promise<string> {
    const transactionParams = {
      from: this.accountAddress
    } as TransactionsParams;

    const contract = new this.web3.eth.Contract(
      WX_BTRFLY_ABI as AbiItem[],
      lookupAddress(this.network, 'WX_BTRFLY_TOKEN_ADDRESS')
    );

    const realIndex = await contract.methods
      .realIndex()
      .call(transactionParams);

    return convertToString(realIndex);
  }
}
