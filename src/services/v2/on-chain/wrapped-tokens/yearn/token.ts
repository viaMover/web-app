import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { currentBalance } from '@/services/chain/erc20/balance';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { EstimateResponse } from '@/services/v2/on-chain/mover';
import { WrappedToken } from '@/services/v2/on-chain/wrapped-tokens/WrappedToken';
import { YearnVaultContract } from '@/services/v2/on-chain/wrapped-tokens/yearn/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import {
  convertToString,
  divide,
  floorDivide,
  fromWei,
  multiply,
  sub,
  toWei
} from '@/utils/bigmath';
import { InMemoryCache } from '@/utils/cache';
import { Network } from '@/utils/networkTypes';
import { YEARN_SIMPLE_VAULT_ABI } from '@/wallet/references/data';
import {
  getSimpleYearnVaultTokenByAddress,
  YearnVaultData
} from '@/wallet/references/yearnVaultsData';
import { SmallToken, SmallTokenInfo, TransactionsParams } from '@/wallet/types';

export class WrappedTokenYearn extends WrappedToken {
  readonly sentryCategoryPrefix: string;
  private readonly vault: YearnVaultData;

  private readonly contractABI = YEARN_SIMPLE_VAULT_ABI;
  private readonly contract: YearnVaultContract;

  private readonly multiplierCache: InMemoryCache<string>;

  constructor(
    wrappedAssetAddress: string,
    accountAddress: string,
    network: Network,
    web3: Web3
  ) {
    super(accountAddress, network, web3);
    const vault = getSimpleYearnVaultTokenByAddress(
      wrappedAssetAddress,
      network
    );
    if (vault === undefined) {
      throw new Error(
        `Can't find simple yearn vault by address: ${wrappedAssetAddress}`
      );
    }
    this.vault = vault;
    this.sentryCategoryPrefix = `wrapped-token.simple-yearn.${this.vault.vaultToken.symbol}`;

    this.contract = new this.web3.eth.Contract(
      this.contractABI as AbiItem[],
      this.vault.vaultToken.address
    );

    this.multiplierCache = new InMemoryCache<string>(
      5 * 60,
      this.getMultiplier.bind(this)
    );
  }

  getUnwrappedToken(): SmallTokenInfo {
    return this.vault.commonToken;
  }

  canHandle(assetAddress: string, network: Network): boolean {
    return (
      network === this.network &&
      sameAddress(this.vault.vaultToken.address, assetAddress)
    );
  }

  public async getUnwrappedAmount(wrappedTokenAmount: string): Promise<string> {
    const mul = await this.multiplierCache.get();
    return multiply(wrappedTokenAmount, mul);
  }

  public async getWrappedAmountByUnwrapped(
    unwrappedTokenAmount: string
  ): Promise<string> {
    const mul = await this.multiplierCache.get();
    return divide(unwrappedTokenAmount, mul);
  }

  async estimateUnwrap(
    inputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<EstimateResponse> {
    try {
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
          vaultName: this.vault.name,
          vaultAddress: this.vault.vaultToken.address,
          vaultCommonToken: this.vault.commonToken.address
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

      const gasLimitObj = await this.contract.methods
        .withdraw(inputAmountInWEI)
        .estimateGas(transactionParams);

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
      this.vault.commonToken.address
    );

    await this._unwrap(inputAsset, inputAmount, changeStepToProcess, gasLimit);

    const balanceAfterUnwrap = await currentBalance(
      this.web3,
      this.accountAddress,
      this.vault.commonToken.address
    );

    return sub(balanceAfterUnwrap, balanceBeforeUnwrap);
  }

  private async _unwrap(
    inputAsset: SmallToken,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
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
        vaultName: this.vault.name,
        vaultAddress: this.vault.vaultToken.address,
        vaultCommonToken: this.vault.commonToken.address
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
        this.contract.methods
          .withdraw(inputAmountInWEI)
          .send(transactionParams),
        resolve,
        reject,
        changeStepToProcess
      );

      return;
    });
  }

  private async getMultiplier(): Promise<string> {
    const multiplier = await (
      this.contract.methods.pricePerShare() as ContractSendMethod
    ).call({
      from: this.accountAddress
    });

    const multiplierInWei = convertToString(multiplier);

    return fromWei(multiplierInWei, this.vault.commonToken.decimals);
  }
}
