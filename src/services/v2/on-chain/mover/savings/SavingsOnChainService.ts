import * as Sentry from '@sentry/vue';
import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/0x/api';
import { MoverAPISubsidizedRequestError } from '@/services/v2/api/mover/subsidized/MoverAPISubsidizedRequestError';
import { NetworkFeatureNotSupportedError } from '@/services/v2/NetworkFeatureNotSupportedError';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { PreparedAction } from '@/services/v2/on-chain/mover/subsidized/types';
import store from '@/store';
import { sameAddress } from '@/utils/address';
import { floorDivide, fromWei, multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';
import { waitOffchainTransactionReceipt } from '@/wallet/offchainExplorer';
import {
  getUSDCAssetData,
  HOLY_HAND_ABI,
  HOLY_POOL_ABI,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import {
  SmallToken,
  SmallTokenInfo,
  Transaction,
  TransactionTypes
} from '@/wallet/types';

import { MoverOnChainService } from '../MoverOnChainService';
import {
  CompoundEstimateResponse,
  EstimateResponse,
  HolyHandContract
} from '../types';
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
      HOLY_HAND_ABI as AbiItem[]
    );
    this.usdcAssetData = getUSDCAssetData(network);
  }

  public async getSavingsAPY(): Promise<GetSavingsAPYReturn | never> {
    return await this.wrapWithSentryLogger(async () => {
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
    return await this.wrapWithSentryLogger(async () => {
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

  public async depositCompound(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    useSubsidized: boolean,
    changeStepToProcess: () => Promise<void>,
    actionGasLimit: string,
    approveGasLimit: string
  ): Promise<TransactionReceipt> {
    try {
      return await this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        async () => {
          if (useSubsidized) {
            return await this.depositSubsidized(
              inputAsset,
              inputAmount,
              changeStepToProcess
            );
          }

          return await this.deposit(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            changeStepToProcess,
            actionGasLimit
          );
        },
        changeStepToProcess,
        approveGasLimit
      );
    } catch (error) {
      Sentry.addBreadcrumb({
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
      throw error;
    }
  }

  public async estimateDepositCompound(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData | undefined
  ): Promise<CompoundEstimateResponse> {
    let isApproveNeeded = true;
    try {
      isApproveNeeded = await this.needsApprove(
        inputAsset,
        inputAmount,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
      );
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit: failed "needsApprove" check',
        data: {
          error,
          inputAsset,
          outputAsset,
          inputAmount,
          transferData
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }

    if (isApproveNeeded) {
      Sentry.addBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message: 'Needs approve'
      });

      try {
        const approveGasLimit = await this.estimateApprove(
          inputAsset.address,
          lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
        );

        return {
          error: false,
          actionGasLimit: ethDefaults.basic_holy_savings_deposit,
          approveGasLimit: approveGasLimit
        };
      } catch (error) {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to estimate deposit: failed "approve" estimation',
          data: {
            error,
            inputAsset,
            outputAsset,
            inputAmount,
            transferData
          }
        });

        return {
          error: true,
          actionGasLimit: '0',
          approveGasLimit: '0'
        };
      }
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
        .estimateGas(
          this.getDefaultTransactionsParams(
            this.mapTransferDataToValue(transferData)
          )
        );

      if (gasLimitObj) {
        const gasLimit = gasLimitObj.toString();
        const gasLimitWithBuffer = floorDivide(
          multiply(gasLimit, '120'),
          '100'
        );
        return {
          error: false,
          actionGasLimit: '0',
          approveGasLimit: gasLimitWithBuffer
        };
      }

      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit: empty gas limit',
        data: {
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          gasLimitObj
        }
      });

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    } catch (error) {
      Sentry.addBreadcrumb({
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

      return {
        error: true,
        approveGasLimit: '0',
        actionGasLimit: '0'
      };
    }
  }

  public async withdrawCompound(
    outputAsset: SmallToken,
    outputAmount: string,
    actionGasLimit: string,
    useSubsidized: boolean,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      if (useSubsidized) {
        return await this.withdrawSubsidized(
          outputAsset,
          outputAmount,
          changeStepToProcess
        );
      }

      return await this.withdraw(
        outputAsset,
        outputAmount,
        actionGasLimit,
        changeStepToProcess
      );
    } catch (error) {
      Sentry.addBreadcrumb({
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

  public async estimateWithdraw(
    outputAsset: SmallToken,
    inputAmount: string
  ): Promise<EstimateResponse> {
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
        const gasLimitWithBuffer = floorDivide(
          multiply(gasLimitObj.toString(), '120'),
          '100'
        );
        return { error: false, gasLimit: gasLimitWithBuffer };
      } else {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to estimate withdraw: empty gas limit',
          data: {
            outputAsset,
            inputAmount
          }
        });

        return { error: true, gasLimit: '0' };
      }
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate withdraw',
        data: {
          error,
          outputAsset,
          inputAmount
        }
      });

      return {
        error: true,
        gasLimit: '0'
      };
    }
  }

  protected async deposit(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData | undefined,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    if (
      !sameAddress(inputAsset.address, outputAsset.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError(
        'Failed to execute deposit: missing transferData'
      );
    }

    try {
      return await new Promise<TransactionReceipt>((resolve, reject) => {
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
          changeStepToProcess,
          {
            poolAddress: lookupAddress(
              this.network,
              'HOLY_SAVINGS_POOL_ADDRESS'
            )
          }
        );
      });
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to deposit',
        data: {
          error,
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          gasLimit
        }
      });

      throw new OnChainServiceError('Failed to execute deposit').wrap(error);
    }
  }

  protected async depositSubsidized(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    if (this.subsidizedOnChainService === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Subsidized Deposit',
        this.network
      );
    }

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    try {
      const preparedAction = await this.prepareSavingsSubsidizedDepositAction(
        lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
        inputAsset.address,
        inputAmountInWEI
      );

      const transactionResult =
        await this.subsidizedAPIService.executeTransaction(
          preparedAction.actionString,
          preparedAction.signature,
          changeStepToProcess
        );

      const tx: Transaction = {
        blockNumber: '0',
        fee: {
          ethPrice: store.getters['account/ethPrice'],
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
      await store.dispatch('account/addTransaction', tx); // fixme remove direct store side-effect

      return await waitOffchainTransactionReceipt(
        transactionResult.queueID,
        transactionResult.txID,
        this.web3Client
      );
    } catch (error) {
      if (error instanceof MoverAPISubsidizedRequestError) {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to execute subsidized transaction',
          data: {
            error: error.message,
            description: error.shortMessage,
            payload: error.payload
          }
        });
      } else {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to execute subsidized transaction',
          data: {
            error: error
          }
        });
      }

      throw new OnChainServiceError(
        'Failed to execute subsidized deposit'
      ).wrap(error);
    }
  }

  protected async withdraw(
    outputAsset: SmallToken,
    outputAmount: string,
    gasLimit: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt | never> {
    try {
      return await new Promise<TransactionReceipt>((resolve, reject) => {
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
          changeStepToProcess,
          {
            poolAddress: lookupAddress(
              this.network,
              'HOLY_SAVINGS_POOL_ADDRESS'
            )
          }
        );
      });
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to withdraw',
        data: {
          error,
          outputAsset,
          outputAmount,
          gasLimit
        }
      });

      throw new OnChainServiceError(`Failed to execute withdraw`).wrap(error);
    }
  }

  protected async withdrawSubsidized(
    outputAsset: SmallToken,
    outputAmount: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      const preparedAction = await this.prepareSavingsSubsidizedWithdrawAction(
        lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
        toWei(outputAmount, outputAsset.decimals)
      );

      const subsidizedResponse =
        await this.subsidizedAPIService.executeTransaction(
          preparedAction.actionString,
          preparedAction.signature,
          changeStepToProcess
        );

      const tx: Transaction = {
        blockNumber: '0',
        fee: {
          ethPrice: store.getters['account/ethPrice'],
          feeInWEI: '0'
        },
        hash: subsidizedResponse.txID ?? '',
        isOffchain: true,
        nonce: '0',
        status: 'pending',
        timestamp: currentTimestamp(),
        type: TransactionTypes.transferERC20,
        uniqHash: subsidizedResponse.txID ? `${subsidizedResponse.txID}-0` : '',
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
        subsidizedQueueId: subsidizedResponse.queueID,
        moverType: 'subsidized_withdraw'
      };
      await store.dispatch('account/addTransaction', tx);

      return await waitOffchainTransactionReceipt(
        subsidizedResponse.queueID,
        subsidizedResponse.txID,
        this.web3Client
      );
    } catch (error) {
      if (error instanceof MoverAPISubsidizedRequestError) {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to execute subsidized transaction',
          data: {
            error: error.message,
            description: error.shortMessage,
            payload: error.payload
          }
        });
      } else {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to execute subsidized transaction',
          data: {
            error: error
          }
        });
      }

      console.error('Failed to execute subsidized withdraw', error);
      throw error;
    }
  }

  estimateWithdrawCompound = async (
    outputAsset: SmallToken,
    inputAmount: string
  ): Promise<CompoundEstimateResponse> => {
    const withdrawEstimate = await this.estimateWithdraw(
      outputAsset,
      inputAmount
    );
    return {
      error: withdrawEstimate.error,
      approveGasLimit: '0',
      actionGasLimit: withdrawEstimate.gasLimit
    };
  };

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
