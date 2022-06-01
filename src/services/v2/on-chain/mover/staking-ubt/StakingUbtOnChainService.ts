import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { OnChainServiceError } from '@/services/v2/on-chain';
import {
  CompoundEstimateResponse,
  MoverOnChainService
} from '@/services/v2/on-chain/mover';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { convertToString, fromWei, multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getUBTAssetData,
  lookupAddress,
  UBT_STAKING_CONTRACT_ABI
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallTokenInfo } from '@/wallet/types';

import { GetStakingUbtAPYReturn, StakingContract } from './types';

export class StakingUbtOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'staking-ubt.on-chain.service';
  protected readonly stakingContract: StakingContract | undefined;
  protected readonly UBTAssetData: SmallTokenInfo;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.stakingContract = this.createContract(
      'STAKING_UBT_CONTRACT_ADDRESS',
      UBT_STAKING_CONTRACT_ABI as AbiItem[]
    );
    this.UBTAssetData = getUBTAssetData(this.network);
  }

  public async getStakingAPY(): Promise<GetStakingUbtAPYReturn | never> {
    return this.wrapWithSentryLogger(async () => {
      if (this.stakingContract === undefined) {
        throw new NetworkFeatureNotSupportedError('UBT APY', this.network);
      }

      const dpyInWEI = await this.stakingContract.methods
        .getDailyAPY()
        .call({ from: this.currentAddress });

      const dpy = fromWei(dpyInWEI, '18');

      const apy = multiply(dpy, 365);
      return {
        apy: apy,
        dpy: dpy
      };
    });
  }

  public async getStakedBalance(): Promise<string> {
    return this.wrapWithSentryLogger(async () => {
      if (this.stakingContract === undefined) {
        throw new NetworkFeatureNotSupportedError('UBT token', this.network);
      }
      const balanceOf = await this.stakingContract.methods
        .getDepositBalance(this.currentAddress)
        .call({ from: this.currentAddress });

      return convertToString(balanceOf);
    });
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
        { inputAsset }
      );
    }

    try {
      return await this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'STAKING_UBT_CONTRACT_ADDRESS'),
        inputAmount,
        (newGasLimit) =>
          this.deposit(
            inputAsset,
            inputAmount,
            changeStepToProcess,
            newGasLimit
          ),
        () => this.estimateDepositCompound(inputAsset, inputAmount),
        changeStepToProcess,
        approveGasLimit,
        actionGasLimit
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
        { inputAsset }
      );
    }

    if (this.stakingContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'UBT staking deposit',
        this.network
      );
    }

    const approveGasLimit = await this.estimateApproveIfNeeded(
      inputAsset,
      inputAmount,
      lookupAddress(this.network, 'STAKING_UBT_CONTRACT_ADDRESS')
    );

    if (approveGasLimit !== undefined) {
      return {
        error: false,
        approveGasLimit: approveGasLimit,
        actionGasLimit: ethDefaults.basic_holy_savings_plus_deposit
      };
    }

    try {
      const gasLimitObj = await this.stakingContract.methods
        .deposit(toWei(inputAmount, inputAsset.decimals))
        .estimateGas({ from: this.currentAddress });

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
          inputAmount
        }
      });

      throw new OnChainServiceError('Failed to estimate deposit').wrap(error);
    }

    throw new OnChainServiceError(
      'Failed to estimate deposit: empty gas limit'
    );
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
        { outputAsset }
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
    if (this.stakingContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'UBT staking withdraw',
        this.network
      );
    }

    try {
      const gasLimitObj = await this.stakingContract.methods
        .withdraw(toWei(outputAmount, outputAsset.decimals))
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
      if (this.stakingContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'UBT staking deposit',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.stakingContract.methods
          .deposit(toWei(inputAmount, inputAsset.decimals))
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
      if (this.stakingContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'UBT staking withdraw',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.stakingContract.methods
          .withdraw(toWei(outputAmount, outputAsset.decimals))
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
