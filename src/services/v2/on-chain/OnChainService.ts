import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { ContractOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import {
  AnyFn,
  CustomContractType,
  ERC20ContractMethods
} from '@/services/v2/on-chain/types';
import { getPureEthAddress, isEth } from '@/utils/address';
import { floorDivide, fromWei, greaterThan, multiply } from '@/utils/bigmath';
import { MAXUINT256 } from '@/utils/consts';
import { Network } from '@/utils/networkTypes';
import { ERC20_ABI } from '@/wallet/references/data';
import { SmallTokenInfo, TransactionsParams } from '@/wallet/types';

import { OnChainServiceError } from './OnChainServiceError';

/**
 * An abstract class representing basic needs of every on-chain service
 */
export abstract class OnChainService {
  // account address
  protected readonly currentAddress: string;

  // current network
  protected readonly network: Network;

  // web3 client
  protected readonly web3Client: Web3;

  // sentry category prefix (used for `Sentry.addBreadcrumb({ category: ... })`
  protected abstract readonly sentryCategoryPrefix: string;

  /**
   * Creates a new instance of `OnChainService`
   * @param currentAddress account address
   * @param network current network
   * @param web3Client `Web3` client
   * @protected
   */
  protected constructor(
    currentAddress: string,
    network: Network,
    web3Client: Web3
  ) {
    this.currentAddress = currentAddress;
    this.network = network;
    this.web3Client = web3Client;
  }

  /**
   * Creates Mover `CustomContractType` by arbitrary contract address, wraps errors internally
   * @param contractAddress An address of Smart Contract
   * @param jsonInterface An ABI of Smart Contract
   * @param options Smart Contract options
   * @protected
   */
  protected createArbitraryContract<M = void>(
    contractAddress: string,
    jsonInterface: AbiItem[] | AbiItem,
    options?: ContractOptions
  ): CustomContractType<M> | undefined {
    try {
      // the reasoning behind try/catch here is this feature of web3-eth:
      // https://web3js.readthedocs.io/en/v1.7.0/web3-eth.html#note-on-checksum-addresses
      return new this.web3Client.eth.Contract(
        jsonInterface,
        contractAddress,
        options
      );
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Wraps `executor` with try/catch that logs a failed action to the
   * Sentry (creates a breadcrumb of `error` type) then throws original `Error`
   * @param executor A function to be executed/wrapped with `Sentry` logger
   * @param breadcrumbPayload -- an additional payload to be included to the Sentry Breadcrumb
   * @protected
   */
  protected async wrapWithSentryLogger<T extends AnyFn>(
    executor: T,
    breadcrumbPayload?: Record<string, unknown>
  ): Promise<ReturnType<T>> {
    try {
      // as each and every function is going to fail under
      // strange circumstances, it's a good idea to add a breadcrumb with some useful info beforehand
      return await executor();
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'On-chain call failed',
        data: {
          ...breadcrumbPayload,
          error: error
        }
      });
      throw error;
    }
  }

  /**
   * Checks whether an `approve` is required for `token` to be spent / processed by `contractAddress`
   * @param token token info
   * @param amountToApprove amount to approve that is needed by transaction to execute successfully
   * @param contractAddress spender Smart Contract address
   * @protected
   */
  protected async needsApprove(
    token: SmallTokenInfo,
    amountToApprove: string,
    contractAddress: string
  ): Promise<boolean | never> {
    // ETH doesn't need approve to be spent by Smart Contracts
    if (isEth(token.address)) {
      return false;
    }

    try {
      const tokenContract = this.createArbitraryContract<ERC20ContractMethods>(
        token.address,
        ERC20_ABI as AbiItem[]
      );

      if (tokenContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          `ERC20 Contract on ${contractAddress}`,
          this.network
        );
      }

      const allowance = await tokenContract.methods
        .allowance(this.currentAddress, contractAddress)
        .call({
          from: contractAddress
        });

      const rawAmount = fromWei(amountToApprove, token.decimals);
      return !greaterThan(allowance, rawAmount);
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to get allowance for token',
        data: {
          token: token,
          spender: contractAddress,
          error: error
        }
      });

      throw new OnChainServiceError(
        `Failed to get allowance for token: ${token.address}`,
        {
          token,
          contractAddress
        }
      ).wrap(error);
    }
  }

  protected async estimateApprove(
    tokenAddress: string,
    spenderAddress: string
  ): Promise<string | never> {
    try {
      const tokenContract = this.createArbitraryContract<ERC20ContractMethods>(
        tokenAddress,
        ERC20_ABI as AbiItem[]
      );

      if (tokenContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          `ERC20 Contract on ${tokenAddress}`,
          this.network
        );
      }

      const gasLimit = await tokenContract.methods
        .approve(spenderAddress, MAXUINT256)
        .estimateGas({
          from: this.currentAddress
        });

      if (gasLimit) {
        return gasLimit.toString();
      }

      throw new Error(`empty gas limit`);
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate approve',
        data: {
          error: error
        }
      });

      throw new OnChainServiceError(
        `Failed to estimate approve for ${tokenAddress}`
      ).wrap(error);
    }
  }

  protected async approve(
    tokenAddress: string,
    spenderAddress: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
      try {
        const tokenContract =
          this.createArbitraryContract<ERC20ContractMethods>(
            tokenAddress,
            ERC20_ABI as AbiItem[]
          );

        if (tokenContract === undefined) {
          throw new NetworkFeatureNotSupportedError(
            `ERC20 Contract on ${tokenAddress}`,
            this.network
          );
        }

        this.wrapWithSendMethodCallbacks(
          tokenContract.methods
            .approve(spenderAddress, MAXUINT256)
            .send(this.getDefaultTransactionsParams(gasLimit, undefined)),
          resolve,
          reject,
          changeStepToProcess,
          { tokenAddress, spenderAddress, gasLimit }
        );
      } catch (error) {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to approve',
          data: {
            error: error
          }
        });

        reject(
          new OnChainServiceError(
            `Failed to execute approve for ${tokenAddress}`
          ).wrap(error)
        );
      }
    });
  }

  /**
   * Wraps the call with the default `PromiEvent` chain handles: `transactionHash`, `receipt`, `error`.
   * Logs service/developer messages to the `console` and `Sentry`
   * @param promiEvent An event with optional chain of `.on(...)` and `.once(...)` handles
   * @param resolve A resolver of transaction call / `new Promise((resolve, reject) => {...})`
   * @param reject A rejecter of transaction call / `new Promise((resolve, reject) => {...})`
   * @param onTransactionHash A callback of successful transaction handling
   * @param breadcrumbPayload `Sentry.addBreadcrumb({data: ...})` payload
   * @protected
   */
  protected wrapWithSendMethodCallbacks<P>(
    promiEvent: PromiEvent<P>,
    resolve: (receipt: TransactionReceipt) => void,
    reject: (error: Error) => void,
    onTransactionHash?: () => void,
    breadcrumbPayload?: Record<string, unknown>
  ): PromiEvent<P> {
    return promiEvent
      .once('transactionHash', (hash: string) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          message: 'Received a transaction hash',
          data: {
            ...breadcrumbPayload,
            hash
          }
        });
        console.info('Received a transaction hash', hash);
        onTransactionHash?.();
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          message: 'Received a transaction receipt',
          data: {
            ...breadcrumbPayload,
            receipt
          }
        });
        console.debug('Received a transaction receipt', receipt);
        resolve(receipt);
      })
      .once('error', (error) => {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'On-chain call failed',
          data: {
            ...breadcrumbPayload,
            error: error
          }
        });

        reject(error);
      });
  }

  protected async executeTransactionWithApprove(
    token: SmallTokenInfo,
    contractAddress: string,
    amount: string,
    action: () => Promise<TransactionReceipt>,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt | never> {
    return this.wrapWithSentryLogger(async () => {
      if (await this.needsApprove(token, amount, contractAddress)) {
        await this.approve(
          token.address,
          contractAddress,
          changeStepToProcess,
          gasLimit
        );
      }

      return await action();
    });
  }

  protected async executeTransactionWithApproveExt(
    action: () => Promise<TransactionReceipt>,
    checkApprove: () => Promise<boolean>,
    approve: () => Promise<TransactionReceipt>
  ): Promise<TransactionReceipt | never> {
    if (!(await checkApprove())) {
      await approve();
    }

    return await action();
  }

  protected substituteAssetAddressIfNeeded(address: string): string {
    if (isEth(address)) {
      return getPureEthAddress();
    }

    return address;
  }

  protected getDefaultTransactionsParams(
    gasLimit: string,
    value?: string
  ): TransactionsParams {
    return OnChainService.getDefaultTransactionsParams(
      this.currentAddress,
      this.web3Client,
      gasLimit,
      value
    );
  }

  protected static getDefaultTransactionsParams(
    fromAddress: string,
    web3Client: Web3,
    gasLimit: string,
    value?: string
  ): TransactionsParams {
    return {
      from: fromAddress,
      value: value,
      gas: web3Client.utils.toBN(gasLimit).toNumber()
    };
  }

  protected addGasBuffer(gas: string, buffer = '120'): string {
    return OnChainService.addGasBuffer(gas, buffer);
  }

  protected static addGasBuffer(gas: string, buffer = '120'): string {
    return floorDivide(multiply(gas, buffer), '100');
  }
}
