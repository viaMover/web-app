import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { ContractOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import {
  AnyFn,
  CustomContractType,
  ERC20ContractMethods
} from '@/services/v2/on-chain/types';
import { getPureEthAddress, isEth } from '@/utils/address';
import { fromWei, greaterThan, multiply } from '@/utils/bigmath';
import { MAXUINT256 } from '@/utils/consts';
import { Network } from '@/utils/networkTypes';
import {
  AddressMapKey,
  ERC20_ABI,
  lookupAddress
} from '@/wallet/references/data';
import { SmallTokenInfo, TransactionsParams } from '@/wallet/types';

import NetworkFeatureNotSupportedError from '../errors/NetworkFeatureNotSupportedError';
import OnChainServiceError from './errors/OnChainServiceError';

/**
 * An abstract class representing basic needs of every on-chain service
 */
export default abstract class OnChainService {
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
   * Creates Mover `CustomContractType` by lookup key, wraps errors internally
   * @param contractAddressMapKey Mover address map key
   * @param jsonInterface An ABI of Smart Contract
   * @param options Smart Contract options
   * @protected
   */
  protected createContract<M = void>(
    contractAddressMapKey: AddressMapKey,
    jsonInterface: AbiItem[] | AbiItem,
    options?: ContractOptions
  ): CustomContractType<M> | undefined {
    const contract = this.createArbitraryContract<M>(
      lookupAddress(this.network, contractAddressMapKey),
      jsonInterface,
      options
    );

    if (contract !== undefined) {
      return contract;
    }

    Sentry.addBreadcrumb({
      type: 'error',
      category: this.sentryCategoryPrefix,
      message: 'Contract is not available in current network',
      data: {
        network: this.network,
        name: contractAddressMapKey
      }
    });
    console.error(
      'Contract is not available in current network',
      contractAddressMapKey,
      this.network
    );
    return undefined;
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
   * @protected
   */
  protected async wrapWithSentryLogger<T extends AnyFn>(
    executor: T
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
          `ERC20 contract on ${contractAddress}`,
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

      console.error('Failed to get allowance for token', token.address, error);

      throw new OnChainServiceError(
        `failed to get allowance for token: ${token.address}: ${
          error.message ?? error
        }`,
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

      console.error(`Failed to estimate approve for ${tokenAddress}`, error);

      throw new OnChainServiceError(
        `failed to estimate approve for ${tokenAddress}: ${error}}`
      ).wrap(error);
    }
  }

  protected async approve(
    tokenAddress: string,
    spenderAddress: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string,
    gasPrice?: string
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

        const transactionParams = {
          from: this.currentAddress,
          gas: this.web3Client.utils.toBN(gasLimit).toNumber(),
          gasPrice: gasPrice
            ? this.web3Client.utils
                .toWei(this.web3Client.utils.toBN(gasPrice), 'gwei')
                .toString()
            : undefined,
          maxPriorityFeePerGas: gasPrice ? undefined : null,
          maxFeePerGas: gasPrice ? undefined : null
        } as TransactionsParams;

        this.wrapWithSendMethodCallbacks(
          tokenContract.methods
            .approve(spenderAddress, MAXUINT256)
            .send(transactionParams),
          resolve,
          reject,
          changeStepToProcess,
          { tokenAddress, spenderAddress, transactionParams }
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

        console.error(`Failed to execute approve for ${tokenAddress}`, error);

        reject(
          new OnChainServiceError(
            `failed to execute approve for ${tokenAddress}: ${error}}`
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
      .once('error', reject);
  }

  protected async executeTransactionWithApprove(
    token: SmallTokenInfo,
    contractAddress: string,
    amount: string,
    action: () => Promise<TransactionReceipt>,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string,
    gasPriceInGwei?: string
  ): Promise<TransactionReceipt | never> {
    return this.wrapWithSentryLogger(async () => {
      if (await this.needsApprove(token, amount, contractAddress)) {
        await this.approve(
          token.address,
          contractAddress,
          changeStepToProcess,
          gasLimit,
          gasPriceInGwei
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

  protected calcTransactionFastNativePrice(
    fastGasPriceGWEI: string,
    txGasLimit: string,
    ethPrice: string
  ): string {
    const fastGasPriceWEI = this.web3Client.utils.toWei(
      fastGasPriceGWEI,
      'gwei'
    );
    const fastTransactionPriceWEI = multiply(txGasLimit, fastGasPriceWEI);
    const fastTransactionPriceEth = fromWei(fastTransactionPriceWEI, '18');
    return multiply(fastTransactionPriceEth, ethPrice);
  }

  protected substituteAssetAddressIfNeeded(address: string): string {
    if (isEth(address)) {
      return getPureEthAddress();
    }

    return address;
  }
}