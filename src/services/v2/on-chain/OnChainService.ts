import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { CompoundEstimateResponse } from '@/services/v2/on-chain/mover';
import { PromiEventWrapper } from '@/services/v2/on-chain/PromiEventWrapper';
import {
  AnyFn,
  CustomContractType,
  ERC20ContractMethods
} from '@/services/v2/on-chain/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { isFeatureEnabled } from '@/settings';
import { getPureBaseAssetAddress, isBaseAsset } from '@/utils/address';
import {
  floorDivide,
  fromWei,
  greaterThan,
  isZero,
  multiply
} from '@/utils/bigmath';
import { MAXUINT256 } from '@/utils/consts';
import { Network } from '@/utils/networkTypes';
import { ERC20_ABI } from '@/wallet/references/data';
import { SmallTokenInfo, TransactionsParams } from '@/wallet/types';

import { OnChainServiceError } from './OnChainServiceError';

/**
 * An abstract class representing basic needs of every on-chain service
 */
export abstract class OnChainService extends PromiEventWrapper {
  // account address
  protected readonly currentAddress: string;

  // current network
  protected readonly network: Network;

  // web3 client
  protected readonly web3Client: Web3;

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
    super();
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
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to create / find Smart Contract at given address',
        data: {
          jsonInterface,
          contractAddress,
          options,
          error
        }
      });
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
      addSentryBreadcrumb({
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
   * Estimates `approve` gasLimit of given token if needed, otherwise returns `undefined`
   * @param token token info
   * @param amountToApprove amount to approve that is needed by transaction to execute successfully
   * @param contractAddress spender Smart Contract address
   * @protected
   */
  protected async estimateApproveIfNeeded(
    token: SmallTokenInfo,
    amountToApprove: string,
    contractAddress: string
  ): Promise<string | undefined> {
    try {
      const needsApprove = await this.needsApprove(
        token,
        amountToApprove,
        contractAddress
      );

      if (!needsApprove) {
        return undefined;
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to "needsApprove" check',
        data: {
          error,
          token,
          amountToApprove,
          contractAddress
        }
      });

      throw new OnChainServiceError('Failed "needsApprove" check').wrap(error);
    }

    addSentryBreadcrumb({
      type: 'debug',
      category: this.sentryCategoryPrefix,
      message: 'Needs approve'
    });

    try {
      return await this.estimateApprove(token.address, contractAddress);
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed "approve" estimation',
        data: {
          error,
          token,
          amountToApprove,
          contractAddress
        }
      });

      throw new OnChainServiceError('Failed approve estimation').wrap(error);
    }
  }

  /**
   * Checks whether an `approve` is required for `token` to be spent / processed by `contractAddress`
   * @param token token info
   * @param amountToApprove amount to approve that is needed by transaction to execute successfully
   * @param contractAddress spender Smart Contract address
   * @private
   */
  private async needsApprove(
    token: SmallTokenInfo,
    amountToApprove: string,
    contractAddress: string
  ): Promise<boolean | never> {
    // Base network asset doesn't need approve to be spent by Smart Contracts
    if (isBaseAsset(token.address, this.network)) {
      return false;
    }

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

    try {
      const allowance = await tokenContract.methods
        .allowance(this.currentAddress, contractAddress)
        .call({
          from: contractAddress
        });

      const rawAmount = fromWei(amountToApprove, token.decimals);
      return !greaterThan(allowance, rawAmount);
    } catch (error) {
      addSentryBreadcrumb({
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

  private async estimateApprove(
    tokenAddress: string,
    spenderAddress: string
  ): Promise<string | never> {
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

    try {
      const gasLimit = await tokenContract.methods
        .approve(spenderAddress, MAXUINT256)
        .estimateGas({
          from: this.currentAddress
        });

      if (gasLimit) {
        return this.addGasBuffer(gasLimit.toString());
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate approve',
        data: {
          tokenAddress,
          spenderAddress,
          error
        }
      });

      throw new OnChainServiceError(
        `Failed to estimate approve for ${tokenAddress}`
      ).wrap(error);
    }

    throw new OnChainServiceError(
      `Failed to estimate approve for ${tokenAddress}: empty gas limit`
    );
  }

  protected async approve(
    tokenAddress: string,
    spenderAddress: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
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

      try {
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
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to approve',
          data: {
            tokenAddress,
            spenderAddress,
            gasLimit,
            error
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

  protected async executeTransactionWithApprove(
    token: SmallTokenInfo,
    contractAddress: string,
    amount: string,
    action: (newGasLimit: string) => Promise<TransactionReceipt>,
    estimateHandler: () => Promise<CompoundEstimateResponse>,
    changeStepToProcess: () => Promise<void>,
    approveGasLimit: string,
    actionGasLimit: string
  ): Promise<TransactionReceipt | never> {
    if (await this.needsApprove(token, amount, contractAddress)) {
      const approveTxReceipt = await this.approve(
        token.address,
        contractAddress,
        changeStepToProcess,
        approveGasLimit
      );

      try {
        // estimate transaction once more to get exact gas limit
        // and prevent expensive transactions and out of gas
        // reverts
        const estimation = await estimateHandler();

        addSentryBreadcrumb({
          type: 'debug',
          message: 'Estimated transaction after approve',
          data: {
            oldGasLimit: actionGasLimit,
            newGasLimit: estimation.actionGasLimit,
            approveTxHash: approveTxReceipt.transactionHash
          }
        });

        actionGasLimit = estimation.actionGasLimit;
      } catch (error) {
        throw new OnChainServiceError(
          'Failed to estimate transaction after approve',
          { approveTxReceipt }
        ).wrap(error);
      }
    }

    return action(actionGasLimit);
  }

  protected async executeTransactionWithApproveExt(
    action: (newGasLimit?: string) => Promise<TransactionReceipt>,
    checkApprove: () => Promise<boolean>,
    approve: () => Promise<TransactionReceipt>,
    estimateHandler: () => Promise<CompoundEstimateResponse>
  ): Promise<TransactionReceipt | never> {
    if (!(await checkApprove())) {
      const approveTxReceipt = await approve();

      let estimation;
      try {
        // estimate transaction once more to get exact gas limit
        // and prevent expensive transactions and out of gas
        // reverts
        estimation = await estimateHandler();

        addSentryBreadcrumb({
          type: 'debug',
          message: 'Estimated transaction after approve',
          data: {
            newGasLimit: estimation.actionGasLimit,
            approveTxHash: approveTxReceipt.transactionHash
          }
        });
      } catch (error) {
        throw new OnChainServiceError(
          'Failed to estimate transaction after approve',
          { approveTxReceipt }
        ).wrap(error);
      }

      return action(estimation.actionGasLimit);
    }

    return action();
  }

  /**
   * Replaces arbitrary address with pure `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
   * in case the given address is base asset of current chain
   * @see getPureBaseAssetAddress
   * @param address token/asset address
   */
  protected substituteAssetAddressIfNeeded(address: string): string {
    return OnChainService.substituteAssetAddressIfNeeded(address, this.network);
  }

  protected static substituteAssetAddressIfNeeded(
    address: string,
    network: Network
  ): string {
    if (isBaseAsset(address, network)) {
      return getPureBaseAssetAddress();
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
      gas: web3Client.utils.toBN(gasLimit).toNumber(),
      gasPrice: undefined,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    };
  }

  /**
   * Replaces gas price with 'undefined' if it is of zero amount or the gas listener
   * is apparently not working
   * @param gasPriceInWei suggested gas price by network gas listeners
   */
  protected substituteGasPriceIfNeeded(
    gasPriceInWei: string
  ): string | undefined {
    return OnChainService.substituteGasPriceIfNeeded(
      gasPriceInWei,
      this.network
    );
  }

  protected static substituteGasPriceIfNeeded(
    gasPriceInWei: string,
    network: Network
  ): string | undefined {
    if (
      !isFeatureEnabled('isGasListenerEnabled', network) ||
      isZero(gasPriceInWei)
    ) {
      return undefined;
    }

    return gasPriceInWei;
  }

  protected addGasBuffer(gas: string | number, buffer = '120'): string {
    return OnChainService.addGasBuffer(gas, buffer);
  }

  protected static addGasBuffer(gas: string | number, buffer = '120'): string {
    return floorDivide(multiply(gas, buffer), '100');
  }
}
