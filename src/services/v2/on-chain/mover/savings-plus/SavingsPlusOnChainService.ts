import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { TransferData } from '@/services/v2/api/0x';
import {
  DepositTransactionData,
  isDepositWithBridgeTransactionData
} from '@/services/v2/api/mover/savings-plus';
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
  getUSDCAssetData,
  HOLY_HAND_ABI,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallTokenInfo } from '@/wallet/types';

export class SavingsPlusOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'savings-plus.on-chain.service';
  protected readonly centralTransferProxyContract: HolyHandContract | undefined;
  protected readonly usdcAssetData: SmallTokenInfo;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.centralTransferProxyContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      HOLY_HAND_ABI as AbiItem[]
    );
    this.usdcAssetData = getUSDCAssetData(network);
  }

  public async estimateDepositCompound(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    depositData: DepositTransactionData | undefined
  ): Promise<CompoundEstimateResponse> {
    if (
      !this.isValidUSDCishToken(inputAsset.address) &&
      !this.isValidUSDCishToken(outputAsset.address)
    ) {
      throw new OnChainServiceError(
        'Wrong tokens supplied to estimateDepositCompound(). ' +
          'Neither inputAsset nor outputAsset is USDC-ish',
        {
          inputAsset,
          outputAsset
        }
      );
    }

    if (depositData === undefined) {
      throw new OnChainServiceError(
        'Failed to estimate deposit: missing depositData'
      );
    }

    if (
      !sameAddress(inputAsset.address, outputAsset.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError(
        'Failed to estimate deposit: missing transferData'
      );
    }

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

    try {
      if (isDepositWithBridgeTransactionData(depositData)) {
        return await this.estimateDepositWithBridge(
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          depositData
        );
      }

      return await this.estimateDeposit(
        inputAsset,
        outputAsset,
        inputAmount,
        transferData,
        depositData
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate deposit',
        data: {
          error,
          inputAsset,
          outputAsset,
          inputAmount
        }
      });

      throw new OnChainServiceError('Failed to estimate deposit').wrap(error);
    }
  }

  public async depositCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    outputAsset: SmallTokenInfo,
    transferData: TransferData,
    depositData: DepositTransactionData,
    changeStepToProcess: () => Promise<void>,
    actionGasLimit: string,
    approveGasLimit: string
  ): Promise<TransactionReceipt> {
    if (depositData === undefined) {
      throw new OnChainServiceError('Failed to deposit: missing depositData');
    }

    if (
      !sameAddress(inputAsset.address, outputAsset.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError('Failed to deposit: missing transferData');
    }

    try {
      // todo revisit once https://github.com/viaMover/web-app/pull/336 is merged to develop
      return this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        () => {
          if (isDepositWithBridgeTransactionData(depositData)) {
            return this.depositWithBridge(
              inputAsset,
              outputAsset,
              inputAmount,
              transferData,
              depositData,
              changeStepToProcess,
              actionGasLimit
            );
          }

          return this.deposit(
            inputAsset,
            inputAmount,
            transferData,
            depositData,
            changeStepToProcess,
            actionGasLimit
          );
        },
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
          outputAsset,
          inputAmount,
          transferData,
          depositData,
          actionGasLimit,
          approveGasLimit
        }
      });

      throw new OnChainServiceError('Failed to deposit').wrap(error);
    }
  }

  protected async estimateDeposit(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    depositData: DepositTransactionData
  ): Promise<CompoundEstimateResponse> {
    if (this.centralTransferProxyContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings Plus deposit',
        this.network
      );
    }

    if (isDepositWithBridgeTransactionData(depositData)) {
      throw new OnChainServiceError(
        'Wrong transaction data passed to estimateDeposit()',
        { depositData }
      );
    }

    const gasLimitObj = await this.centralTransferProxyContract.methods
      .depositToPool(
        depositData.depositPoolAddress,
        this.substituteAssetAddressIfNeeded(inputAsset.address),
        toWei(inputAmount, inputAsset.decimals),
        this.mapTransferDataToExpectedMinimumAmount(transferData),
        this.mapTransferDataToBytes(transferData)
      )
      .estimateGas({
        from: this.currentAddress,
        value: this.mapTransferDataToValue(transferData)
      });

    return {
      error: false,
      approveGasLimit: '0',
      actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
    };
  }

  protected async estimateDepositWithBridge(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    depositData: DepositTransactionData
  ): Promise<CompoundEstimateResponse> {
    if (this.centralTransferProxyContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings Plus deposit',
        this.network
      );
    }

    const gasLimitObj = await this.centralTransferProxyContract.methods
      .swapBridgeAsset(
        this.substituteAssetAddressIfNeeded(inputAsset.address),
        outputAsset.address,
        toWei(inputAmount, inputAsset.decimals),
        this.mapTransferDataToExpectedMinimumAmount(transferData),
        this.mapTransferDataToBytes(transferData),
        this.mapDepositDataToBytes(depositData)
      )
      .estimateGas({
        from: this.currentAddress,
        value: this.mapTransferDataToValue(transferData)
      });

    return {
      error: false,
      approveGasLimit: '0',
      actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
    };
  }

  protected async deposit(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData,
    depositData: DepositTransactionData,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.centralTransferProxyContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Savings Plus deposit',
          this.network
        );
      }

      if (isDepositWithBridgeTransactionData(depositData)) {
        throw new OnChainServiceError(
          'Wrong transaction data passed to the deposit()',
          {
            depositData
          }
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.centralTransferProxyContract.methods
          .depositToPool(
            depositData.depositPoolAddress,
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
        changeStepToProcess
      );
    });
  }

  protected async depositWithBridge(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData,
    depositData: DepositTransactionData,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.centralTransferProxyContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Savings Plus deposit',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.centralTransferProxyContract.methods
          .swapBridgeAsset(
            this.substituteAssetAddressIfNeeded(inputAsset.address),
            this.substituteAssetAddressIfNeeded(outputAsset.address),
            toWei(inputAmount, inputAsset.decimals),
            this.mapTransferDataToExpectedMinimumAmount(transferData),
            this.mapTransferDataToBytes(transferData),
            this.mapDepositDataToBytes(depositData)
          )
          .send(
            this.getDefaultTransactionsParams(
              gasLimit,
              this.mapTransferDataToValue(transferData)
            )
          ),
        resolve,
        reject,
        changeStepToProcess
      );
    });
  }

  protected isValidUSDCishToken(address: string): boolean {
    return sameAddress(address, this.usdcAssetData.address);
  }

  protected mapDepositDataToBytes(data?: DepositTransactionData): number[] {
    return SavingsPlusOnChainService.mapDepositDataToBytes(
      this.web3Client,
      data
    );
  }

  protected static mapDepositDataToBytes(
    web3Client: Web3,
    data?: DepositTransactionData
  ): number[] {
    if (data === undefined || !isDepositWithBridgeTransactionData(data)) {
      return [];
    }

    return Array.prototype.concat(
      web3Client.utils.hexToBytes(data.bridgeTxAddress),
      web3Client.utils.hexToBytes(data.bridgeTxData)
    );
  }
}
