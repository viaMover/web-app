import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { OnChainServiceError } from '@/services/v2/on-chain';
import {
  CompoundEstimateResponse,
  MoverOnChainService
} from '@/services/v2/on-chain/mover';
import { HolyHandContract } from '@/services/v2/on-chain/mover/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getUBTAssetData,
  HOLY_HAND_ABI,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallTokenInfo } from '@/wallet/types';

export class StakingUbtOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'staking-ubt.on-chain.service';
  protected readonly holyHandContract: HolyHandContract | undefined;
  protected readonly UBTAssetData: SmallTokenInfo;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.holyHandContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      HOLY_HAND_ABI as AbiItem[]
    );
    this.UBTAssetData = getUBTAssetData(this.network);
  }

  public async depositCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    actionGasLimit: string,
    approveGasLimit: string
  ): Promise<TransactionReceipt> {
    if (!sameAddress(inputAsset.address, this.UBTAssetData.address)) {
      throw new OnChainServiceError(
        'Wrong token supplied to depositCompound()',
        inputAsset
      );
    }

    try {
      return await this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        () =>
          this.deposit(
            inputAsset,
            inputAmount,
            changeStepToProcess,
            actionGasLimit
          ),
        changeStepToProcess,
        approveGasLimit
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to deposit',
        data: {
          error,
          inputAsset,
          inputAmount,
          actionGasLimit,
          approveGasLimit
        }
      });

      throw new OnChainServiceError('Failed to deposit').wrap(error);
    }
  }

  public async estimateDepositCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<CompoundEstimateResponse> {
    if (!sameAddress(inputAsset.address, this.UBTAssetData.address)) {
      throw new OnChainServiceError(
        'Wrong token supplied to estimateDepositCompound()',
        inputAsset
      );
    }

    let isApproveNeeded = true;
    try {
      isApproveNeeded = await this.needsApprove(
        inputAsset,
        inputAmount,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS')
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit: failed "needsApprove" check',
        data: {
          error,
          inputAsset,
          inputAmount
        }
      });

      throw new OnChainServiceError('Failed needsApprove check').wrap(error);
    }

    if (isApproveNeeded) {
      addSentryBreadcrumb({
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
          actionGasLimit: ethDefaults.basic_holy_staking_deposit_ubt,
          approveGasLimit: approveGasLimit
        };
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to estimate deposit: failed "approve" estimation',
          data: {
            error,
            inputAsset,
            inputAmount
          }
        });

        throw new OnChainServiceError('Failed approve estimation').wrap(error);
      }
    }

    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'UBT staking deposit',
        this.network
      );
    }

    try {
      const gasLimitObj = this.holyHandContract.methods
        .stakeUbt(toWei(inputAmount, inputAsset.decimals))
        .estimateGas({ from: this.currentAddress });

      return {
        error: false,
        approveGasLimit: '0',
        actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
      };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit',
        data: {
          error,
          inputAsset,
          inputAmount
        }
      });

      throw new OnChainServiceError('Failed to estimate deposit').wrap(error);
    }
  }

  public async withdrawCompound(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    changeStepToProcess: () => Promise<void>,
    actionGasLimit: string
  ): Promise<TransactionReceipt> {
    if (!sameAddress(outputAsset.address, this.UBTAssetData.address)) {
      throw new OnChainServiceError(
        'Wrong token supplied to withdrawCompound()',
        outputAsset
      );
    }

    try {
      return await this.withdraw(
        outputAsset,
        outputAmount,
        changeStepToProcess,
        actionGasLimit
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to withdraw',
        data: {
          error,
          outputAsset,
          outputAmount,
          actionGasLimit
        }
      });

      throw new OnChainServiceError('Failed to withdraw').wrap(error);
    }
  }

  public async estimateWithdrawCompound(
    outputAsset: SmallTokenInfo,
    outputAmount: string
  ): Promise<CompoundEstimateResponse> {
    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'UBT staking withdraw',
        this.network
      );
    }

    try {
      const gasLimitObj = this.holyHandContract.methods
        .unstakeUbt(toWei(outputAmount, outputAsset.decimals))
        .estimateGas({ from: this.currentAddress });

      return {
        error: false,
        actionGasLimit: this.addGasBuffer(gasLimitObj.toString()),
        approveGasLimit: '0'
      };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate withdraw',
        data: {
          error,
          outputAsset,
          outputAmount
        }
      });

      throw new OnChainServiceError('Failed to estimate withdraw').wrap(error);
    }
  }

  protected async deposit(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.holyHandContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'UBT staking deposit',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.holyHandContract.methods
          .stakeUbt(toWei(inputAmount, inputAsset.decimals))
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        {
          gasLimit
        }
      );
    });
  }

  protected async withdraw(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.holyHandContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'UBT staking withdraw',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.holyHandContract.methods
          .unstakeUbt(toWei(outputAmount, outputAsset.decimals))
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        {
          gasLimit
        }
      );
    });
  }
}
