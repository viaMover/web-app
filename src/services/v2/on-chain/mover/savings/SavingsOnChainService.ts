import * as Sentry from '@sentry/vue';
import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/0x/api';
import { MoverAPISubsidizedRequestError } from '@/services/v2/api/mover/subsidized/MoverAPISubsidizedRequestError';
import { NetworkFeatureNotSupportedError } from '@/services/v2/NetworkFeatureNotSupportedError';
import { PreparedAction } from '@/services/v2/on-chain/mover/subsidized/types';
import store from '@/store';
import { convertStringToHexWithPrefix, sameAddress } from '@/utils/address';
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
  TransactionsParams,
  TransactionTypes
} from '@/wallet/types';

import { OnChainServiceError } from '../../OnChainServiceError';
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
    approveGasLimit: string,
    gasPriceInGwei?: string
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
              outputAsset,
              inputAmount,
              transferData,
              changeStepToProcess
            );
          }

          return await this.deposit(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            changeStepToProcess,
            actionGasLimit,
            gasPriceInGwei
          );
        },
        changeStepToProcess,
        approveGasLimit,
        gasPriceInGwei
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
          gasPriceInGwei,
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

      console.info('Deposit: "approve" is needed');

      try {
        const approveGasLimit = await this.estimateApprove(
          inputAsset.address,
          lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
        );

        console.info(
          'Deposit: fallback action gas limit is used',
          ethDefaults.basic_holy_savings_deposit
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

        console.error(
          'Failed to estimate deposit: failed "approve" estimation',
          error
        );

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
        'failed to estimate deposit: missing transferData'
      );
    }

    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings deposit',
        this.network
      );
    }

    try {
      let value = undefined;

      if (transferData) {
        value = this.web3Client.utils.toHex(transferData.value);
      }

      const transactionParams = {
        from: this.currentAddress,
        value: value
      } as TransactionsParams;

      const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

      let bytesData = [];
      let expectedMinimumReceived = '0';

      if (transferData) {
        expectedMinimumReceived = new BigNumber(
          multiply(transferData.buyAmount, '0.85')
        ).toFixed(0);

        const valueBytes = this.web3Client.utils.hexToBytes(
          this.web3Client.utils.padLeft(
            convertStringToHexWithPrefix(transferData.value),
            64
          )
        );

        bytesData = Array.prototype.concat(
          this.web3Client.utils.hexToBytes(transferData.to),
          this.web3Client.utils.hexToBytes(transferData.allowanceTarget),
          valueBytes,
          this.web3Client.utils.hexToBytes(transferData.data)
        );

        // TODO: add to the Sentry breadcrumbs
        // this.web3Client.utils.bytesToHex(bytesData);
      }

      const gasLimitObj = await this.holyHandContract.methods
        .depositToPool(
          lookupAddress(this.network, 'HOLY_SAVINGS_POOL_ADDRESS'),
          this.substituteAssetAddressIfNeeded(inputAsset.address),
          inputAmountInWEI,
          expectedMinimumReceived,
          bytesData
        )
        .estimateGas(transactionParams);

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

  protected async deposit(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData | undefined,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string,
    gasPriceInGwei?: string
  ): Promise<TransactionReceipt | never> {
    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings deposit',
        this.network
      );
    }

    if (
      !sameAddress(inputAsset.address, outputAsset.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError(
        'Failed to execute deposit: missing transferData'
      );
    }

    try {
      let value;

      if (transferData) {
        value = this.web3Client.utils.toHex(transferData.value);
      }

      const transactionParams = {
        from: this.currentAddress,
        value: value,
        gas: this.web3Client.utils.toBN(gasLimit).toNumber(),
        gasPrice: gasPriceInGwei
          ? this.web3Client.utils
              .toWei(this.web3Client.utils.toBN(gasPriceInGwei), 'gwei')
              .toString()
          : undefined,
        maxFeePerGas: gasPriceInGwei ? undefined : null,
        maxPriorityFeePerGas: gasPriceInGwei ? undefined : null
      } as TransactionsParams;

      const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

      let bytesData: number[] = [];
      let expectedMinimumReceived = '0';

      if (transferData) {
        expectedMinimumReceived = new BigNumber(
          multiply(transferData.buyAmount, '0.85')
        ).toFixed(0);

        const valueBytes = this.web3Client.utils.hexToBytes(
          this.web3Client.utils.padLeft(
            convertStringToHexWithPrefix(transferData.value),
            64
          )
        );

        bytesData = Array.prototype.concat(
          this.web3Client.utils.hexToBytes(transferData.to),
          this.web3Client.utils.hexToBytes(transferData.allowanceTarget),
          valueBytes,
          this.web3Client.utils.hexToBytes(transferData.data)
        );
      }

      const inputCurrencyAddress = this.substituteAssetAddressIfNeeded(
        inputAsset.address
      );

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
              inputCurrencyAddress,
              inputAmountInWEI,
              expectedMinimumReceived,
              bytesData
            )
            .send(transactionParams),
          resolve,
          reject,
          changeStepToProcess,
          {
            poolAddress: lookupAddress(
              this.network,
              'HOLY_SAVINGS_POOL_ADDRESS'
            ),
            inputCurrencyAddress,
            inputAmountInWEI,
            expectedMinimumReceived,
            bytesData: this.web3Client.utils.bytesToHex(bytesData)
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
          gasLimit,
          gasPriceInGwei
        }
      });

      throw new OnChainServiceError(`Failed to execute deposit`).wrap(error);
    }
  }

  protected async depositSubsidized(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
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

      console.error('Failed to execute subsidized transaction', error);
      throw error;
    }
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
