import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { MoverAPISubsidizedRequestError } from '@/services/v2/api/mover/subsidized/MoverAPISubsidizedRequestError';
import { TransferData } from '@/services/v2/api/swap';
import { NetworkFeatureNotSupportedError } from '@/services/v2/NetworkFeatureNotSupportedError';
import { OnChainServiceError, TransactionResult } from '@/services/v2/on-chain';
import { PreparedAction } from '@/services/v2/on-chain/mover/subsidized/types';
import { SubsidizedTransactionExecutionResult } from '@/services/v2/on-chain/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import {
  TransactionScenario,
  TransactionScenarioState,
  TransactionState,
  TransactionStateEventBus
} from '@/services/v2/utils/transaction-state-event-bus';
import { sameAddress } from '@/utils/address';
import { fromWei, multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';
import {
  getCentralTransferProxyAbi,
  getUSDCAssetData,
  HOLY_POOL_ABI,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallTokenInfo, Transaction, TransactionTypes } from '@/wallet/types';

import { MoverOnChainService } from '../MoverOnChainService';
import { CompoundEstimateResponse, HolyHandContract } from '../types';
import { GetSavingsAPYReturn, HolySavingsPoolContract } from './types';

export class SavingsOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'savings.on-chain.service';
  protected readonly savingsPoolContract: HolySavingsPoolContract | undefined;
  protected readonly holyHandContract: HolyHandContract | undefined;
  protected readonly usdcAssetData: SmallTokenInfo;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.savingsPoolContract = this.createContract(
      'HOLY_SAVINGS_POOL_ADDRESS',
      HOLY_POOL_ABI as AbiItem[]
    );
    this.holyHandContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      getCentralTransferProxyAbi(network)
    );
    this.usdcAssetData = getUSDCAssetData(network);
  }

  public async getSavingsAPY(): Promise<GetSavingsAPYReturn | never> {
    return this.wrapWithSentryLogger(async () => {
      if (this.savingsPoolContract === undefined) {
        throw new NetworkFeatureNotSupportedError('Savings APY', this.network);
      }

      const savingsDPYinWEI = await this.savingsPoolContract.methods
        .getDailyAPY()
        .call({ from: this.currentAddress });

      const savingsDPY = fromWei(savingsDPYinWEI, 18);
      const savingsAPY = multiply(savingsDPY, 365);
      return {
        apy: savingsAPY,
        dpy: savingsDPY
      };
    });
  }

  public async getSavingsBalance(): Promise<string | never> {
    return this.wrapWithSentryLogger(async () => {
      if (this.savingsPoolContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Savings Balance',
          this.network
        );
      }

      const savingsResponse = await this.savingsPoolContract.methods
        .getDepositBalance(this.currentAddress)
        .call({ from: this.currentAddress });

      const savingsBalanceInWEI = new BigNumber(savingsResponse.toString());
      return fromWei(savingsBalanceInWEI, this.usdcAssetData.decimals);
    });
  }

  public async explainDepositCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<TransactionScenario> {
    try {
      const scenario = new Array<TransactionScenarioState>();
      const needsApprove = this.needsApprove(
        inputAsset,
        inputAmount,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
      );
      if (needsApprove) {
        scenario.push({
          type: TransactionState.Approve,
          tokenAddress: inputAsset.address,
          network: this.network
        });
      }

      scenario.push({
        type: TransactionState.Deposit,
        tokenAddress: inputAsset.address,
        network: this.network
      });

      return scenario;
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to build transaction scenario',
        data: {
          error
        }
      });

      throw new OnChainServiceError(
        'Failed to build transaction scenario'
      ).wrap(error);
    }
  }

  public async depositCompound(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    useSubsidized: boolean,
    actionGasLimit: string,
    approveGasLimit: string,
    eventBus: TransactionStateEventBus
  ): Promise<TransactionResult> {
    try {
      const result = await this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        (newGasLimit) => {
          if (useSubsidized) {
            return this.depositSubsidized(inputAsset, inputAmount, eventBus);
          }

          return this.deposit(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            newGasLimit,
            eventBus
          );
        },
        () =>
          this.estimateDepositCompound(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData
          ),
        approveGasLimit,
        actionGasLimit,
        eventBus
      );

      eventBus.dispatch(TransactionState.Confirmed, result);
      return result;
    } catch (error) {
      eventBus.dispatch(TransactionState.Rejected, { error });
      if (error instanceof MoverAPISubsidizedRequestError) {
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to execute subsidized deposit',
          data: {
            error: error.message,
            description: error.shortMessage,
            payload: error.payload,
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            useSubsidized
          }
        });

        throw error;
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to deposit',
        data: {
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          useSubsidized,
          actionGasLimit,
          approveGasLimit,
          error
        }
      });
      throw new OnChainServiceError('Failed to execute deposit').wrap(error);
    }
  }

  public async estimateDepositCompound(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined
  ): Promise<CompoundEstimateResponse> {
    const approveGasLimit = await this.estimateApproveIfNeeded(
      inputAsset,
      inputAmount,
      lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
    );

    if (approveGasLimit !== undefined) {
      return {
        error: false,
        approveGasLimit: approveGasLimit,
        actionGasLimit: ethDefaults.basic_holy_savings_plus_deposit
      };
    }

    if (
      !sameAddress(inputAsset.address, outputAsset.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError(
        'Failed to estimate deposit: missing transferData'
      );
    }

    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings deposit',
        this.network
      );
    }

    try {
      const gasLimitObj = await this.holyHandContract.methods
        .depositToPool(
          lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
          this.substituteAssetAddressIfNeeded(inputAsset.address),
          toWei(inputAmount, inputAsset.decimals),
          this.mapTransferDataToExpectedMinimumAmount(transferData),
          this.mapTransferDataToBytes(transferData)
        )
        .estimateGas({
          from: this.currentAddress,
          value: this.mapTransferDataToValue(transferData)
        });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit',
        data: {
          error,
          inputAsset,
          outputAsset,
          inputAmount,
          transferData
        }
      });

      throw new OnChainServiceError('Failed to estimate deposit').wrap(error);
    }

    addSentryBreadcrumb({
      type: 'error',
      category: this.sentryCategoryPrefix,
      message: 'Failed to estimate deposit: empty gas limit',
      data: {
        inputAsset,
        outputAsset,
        inputAmount,
        transferData
      }
    });

    throw new OnChainServiceError(
      'Failed to estimate deposit: empty gas limit'
    );
  }

  public async explainWithdrawCompound(
    outputAsset: SmallTokenInfo
  ): Promise<TransactionScenario> {
    try {
      return [
        {
          type: TransactionState.Withdraw,
          tokenAddress: outputAsset.address,
          network: this.network
        }
      ];
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to build transaction scenario',
        data: {
          error
        }
      });

      throw new OnChainServiceError(
        'Failed to build transaction scenario'
      ).wrap(error);
    }
  }

  public async withdrawCompound(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    actionGasLimit: string,
    useSubsidized: boolean,
    eventBus: TransactionStateEventBus
  ): Promise<TransactionResult> {
    try {
      if (useSubsidized) {
        const result = await this.withdrawSubsidized(
          outputAsset,
          outputAmount,
          eventBus
        );

        eventBus.dispatch(TransactionState.Confirmed, result);
        return result;
      }

      const receipt = await this.withdraw(
        outputAsset,
        outputAmount,
        actionGasLimit,
        eventBus
      );
      eventBus.dispatch(TransactionState.Confirmed, receipt);
      return receipt;
    } catch (error) {
      if (error instanceof MoverAPISubsidizedRequestError) {
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to execute subsidized withdraw',
          data: {
            error: error.message,
            description: error.shortMessage,
            payload: error.payload,
            outputAsset,
            outputAmount,
            actionGasLimit,
            useSubsidized
          }
        });
        throw error;
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to withdraw',
        data: {
          outputAsset,
          outputAmount,
          actionGasLimit,
          useSubsidized,
          error
        }
      });
      throw error;
    }
  }

  public async estimateWithdrawCompound(
    outputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<CompoundEstimateResponse> {
    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings withdraw',
        this.network
      );
    }

    try {
      const gasLimitObj = await this.holyHandContract.methods
        .withdrawFromPool(
          lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
          toWei(inputAmount, outputAsset.decimals)
        )
        .estimateGas({
          from: this.currentAddress
        });

      if (gasLimitObj) {
        return {
          error: false,
          approveGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate withdraw',
        data: {
          error,
          outputAsset,
          inputAmount
        }
      });

      throw new OnChainServiceError('Failed to estimate withdraw').wrap(error);
    }

    addSentryBreadcrumb({
      type: 'error',
      category: this.sentryCategoryPrefix,
      message: 'Failed to estimate withdraw: empty gas limit',
      data: {
        outputAsset,
        inputAmount
      }
    });

    throw new OnChainServiceError(
      'Failed to estimate withdraw: empty gas limit'
    );
  }

  protected async deposit(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    gasLimit: string,
    eventBus: TransactionStateEventBus
  ): Promise<TransactionReceipt> {
    if (
      !sameAddress(inputAsset.address, outputAsset.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError(
        'Failed to execute deposit: missing transferData'
      );
    }

    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.holyHandContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Savings deposit',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.holyHandContract.methods
          .depositToPool(
            lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
            this.substituteAssetAddressIfNeeded(inputAsset.address),
            toWei(inputAmount, inputAsset.decimals),
            this.mapTransferDataToExpectedMinimumAmount(transferData),
            this.mapTransferDataToBytes(transferData)
          )
          .send(
            this.getDefaultTransactionsParams(
              gasLimit,
              this.mapTransferDataToValue(transferData)
            )
          ),
        resolve,
        reject,
        () =>
          eventBus.dispatch(TransactionState.Deposit, {
            tokenAddress: inputAsset.address,
            amount: inputAmount
          }),
        {
          poolAddress: lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
          gasLimit
        }
      );
    });
  }

  protected async depositSubsidized(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    eventBus: TransactionStateEventBus
  ): Promise<SubsidizedTransactionExecutionResult> {
    if (this.subsidizedOnChainService === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Subsidized Deposit',
        this.network
      );
    }

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    eventBus.dispatch(TransactionState.AwaitingForInput, {
      nextState: TransactionState.Deposit
    });
    const preparedAction = await this.prepareSavingsSubsidizedDepositAction(
      lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
      this.substituteAssetAddressIfNeeded(inputAsset.address),
      inputAmountInWEI
    );

    const transactionResult =
      await this.subsidizedAPIService.executeTransaction(
        preparedAction.actionString,
        preparedAction.signature,
        () =>
          eventBus.dispatch(TransactionState.Deposit, {
            tokenAddress: inputAsset.address,
            amount: inputAmount
          })
      );

    const tx: Transaction = {
      blockNumber: '0',
      fee: {
        ethPrice: this.ethPriceGetterHandler?.() ?? '0',
        feeInWEI: '0'
      },
      hash: transactionResult.txID ?? '',
      isOffchain: true,
      nonce: '0',
      status: 'pending',
      timestamp: currentTimestamp(),
      type: TransactionTypes.transferERC20,
      uniqHash: transactionResult.txID ? `${transactionResult.txID}-0` : '',
      asset: {
        address: inputAsset.address,
        change: toWei(inputAmount, inputAsset.decimals),
        decimals: inputAsset.decimals,
        direction: 'out',
        iconURL: '',
        price: '0',
        symbol: inputAsset.symbol
      },
      from: this.currentAddress,
      to: lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
      subsidizedQueueId: transactionResult.queueID,
      moverType: 'subsidized_deposit'
    };
    await this.addTransactionToStoreHandler?.(tx);
    return transactionResult; // TODO: plan execution result fetch
  }

  protected async withdraw(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    gasLimit: string,
    eventBus: TransactionStateEventBus
  ): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
      if (this.holyHandContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Savings withdraw',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.holyHandContract.methods
          .withdrawFromPool(
            lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
            toWei(outputAmount, outputAsset.decimals)
          )
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        (hash) =>
          eventBus.dispatch(TransactionState.Withdraw, {
            tokenAddress: outputAsset.address,
            amount: outputAmount,
            hash
          }),
        {
          poolAddress: lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
          gasLimit
        }
      );
    });
  }

  protected async withdrawSubsidized(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    eventBus: TransactionStateEventBus
  ): Promise<SubsidizedTransactionExecutionResult> {
    eventBus.dispatch(TransactionState.AwaitingForInput, {
      nextState: TransactionState.Withdraw
    });
    const preparedAction = await this.prepareSavingsSubsidizedWithdrawAction(
      lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
      toWei(outputAmount, outputAsset.decimals)
    );

    const transactionResult =
      await this.subsidizedAPIService.executeTransaction(
        preparedAction.actionString,
        preparedAction.signature,
        () =>
          eventBus.dispatch(TransactionState.Withdraw, {
            tokenAddress: outputAsset.address,
            amount: outputAmount // TODO: what to return here?
          })
      );

    const tx: Transaction = {
      blockNumber: '0',
      fee: {
        ethPrice: this.ethPriceGetterHandler?.() ?? '0',
        feeInWEI: '0'
      },
      hash: transactionResult.txID ?? '',
      isOffchain: true,
      nonce: '0',
      status: 'pending',
      timestamp: currentTimestamp(),
      type: TransactionTypes.transferERC20,
      uniqHash: transactionResult.txID ? `${transactionResult.txID}-0` : '',
      asset: {
        address: outputAsset.address,
        change: toWei(outputAmount, outputAsset.decimals),
        decimals: outputAsset.decimals,
        direction: 'in',
        iconURL: '',
        price: '0',
        symbol: outputAsset.symbol
      },
      from: lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
      to: this.currentAddress,
      subsidizedQueueId: transactionResult.queueID,
      moverType: 'subsidized_withdraw'
    };
    await this.addTransactionToStoreHandler?.(tx);
    return transactionResult;
  }

  protected async prepareSavingsSubsidizedDepositAction(
    poolAddress: string,
    tokenAddress: string,
    amount: string
  ): Promise<PreparedAction> {
    return this.prepareSubsidizedAction(
      `ON BEHALF ${
        this.currentAddress
      } TIMESTAMP ${dayjs().unix()} EXECUTE DEPOSIT TOKEN ${tokenAddress} TO_DESTINATION ${poolAddress} AMOUNT ${amount}`
    );
  }

  protected async prepareSavingsSubsidizedWithdrawAction(
    poolAddress: string,
    amount: string
  ): Promise<PreparedAction> {
    return this.prepareSubsidizedAction(
      `ON BEHALF ${
        this.currentAddress
      } TIMESTAMP ${dayjs().unix()} EXECUTE WITHDRAW FROM ${poolAddress} AMOUNT_TOKEN ${amount}`
    );
  }
}
