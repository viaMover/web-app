import dayjs from 'dayjs';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';

import { MoverError, NetworkFeatureNotSupportedError } from '@/services/v2';
import { TransferData } from '@/services/v2/api/0x';
import {
  DepositOnlyTransactionData,
  DepositTransactionData,
  DepositWithBridgeTransactionData,
  isDepositWithBridgeTransactionData,
  isWithdrawComplexTransactionData,
  WithdrawOnlyTransactionData,
  WithdrawTransactionData
} from '@/services/v2/api/mover/savings-plus';
import { OnChainServiceError } from '@/services/v2/on-chain';
import {
  CompoundEstimateResponse,
  MoverOnChainService
} from '@/services/v2/on-chain/mover';
import { InvalidNetworkForOperationError } from '@/services/v2/on-chain/mover/savings-plus/InvalidNetworkForOperationError';
import { PreparedAction } from '@/services/v2/on-chain/mover/subsidized';
import { HolyHandContract } from '@/services/v2/on-chain/mover/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { getInteger, multiply, sub, toWei } from '@/utils/bigmath';
import { getNetwork, Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';
import { waitOffchainTransactionReceipt } from '@/wallet/offchainExplorer';
import {
  getCentralTransferProxyAbi,
  getUSDCAssetData,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallTokenInfo, Transaction, TransactionTypes } from '@/wallet/types';

export class SavingsPlusOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'savings-plus.on-chain.service';
  protected readonly centralTransferProxyContract: HolyHandContract | undefined;
  protected readonly usdcAssetData: SmallTokenInfo;
  protected static MintMultiplier = 0.995;
  protected static DyMultiplier = 0.98;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.centralTransferProxyContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      getCentralTransferProxyAbi(network)
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
    if (!this.isValidUSDCishToken(outputAsset.address)) {
      throw new OnChainServiceError(
        'Wrong token supplied to estimateDepositCompound(). ' +
          'outputAsset is not USDC-ish',
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
        addSentryBreadcrumb({
          type: 'debug',
          category: this.sentryCategoryPrefix,
          message: 'Needs bridge. Will estimateDepositWithBridge',
          data: {
            inputAsset,
            outputAsset,
            transferData,
            depositData
          }
        });

        return await this.estimateDepositWithBridge(
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          depositData
        );
      }

      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message: 'Does not need bridge. Will estimateDeposit',
        data: {
          inputAsset,
          outputAsset,
          transferData,
          depositData
        }
      });

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
          inputAmount,
          transferData,
          depositData
        }
      });

      throw new OnChainServiceError('Failed to estimate deposit').wrap(error);
    }
  }

  public async depositCompound(
    inputAsset: SmallTokenInfo,
    outputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    depositData: DepositTransactionData,
    changeStepToProcess: () => Promise<void>,
    actionGasLimit: string,
    approveGasLimit: string
  ): Promise<TransactionReceipt> {
    if (!this.isValidUSDCishToken(outputAsset.address)) {
      throw new OnChainServiceError(
        'Wrong token supplied to depositCompound(). ' +
          'outputAsset is not USDC-ish',
        {
          inputAsset,
          outputAsset
        }
      );
    }

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
      return this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        (newGasLimit) => {
          if (isDepositWithBridgeTransactionData(depositData)) {
            addSentryBreadcrumb({
              type: 'debug',
              category: this.sentryCategoryPrefix,
              message: 'Needs bridge. Will depositWithBridge',
              data: {
                inputAsset,
                outputAsset,
                transferData,
                depositData
              }
            });

            return this.depositWithBridge(
              inputAsset,
              outputAsset,
              inputAmount,
              transferData,
              depositData,
              changeStepToProcess,
              newGasLimit
            );
          }

          addSentryBreadcrumb({
            type: 'debug',
            category: this.sentryCategoryPrefix,
            message: 'Does not need bridge. Will deposit',
            data: {
              inputAsset,
              outputAsset,
              transferData,
              depositData
            }
          });

          return this.deposit(
            inputAsset,
            inputAmount,
            transferData,
            depositData,
            changeStepToProcess,
            newGasLimit
          );
        },
        () =>
          this.estimateDepositCompound(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            depositData
          ),
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

  public async estimateWithdrawCompound(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    withdrawToNetwork: Network,
    withdrawData?: WithdrawTransactionData
  ): Promise<CompoundEstimateResponse> {
    if (!this.isValidUSDCishToken(outputAsset.address)) {
      throw new OnChainServiceError(
        'Wrong token supplied to estimateWithdrawCompound(). Output asset must be USDC-ish',
        {
          outputAsset
        }
      );
    }

    if (withdrawData === undefined) {
      throw new OnChainServiceError('Failed to withdraw: missing withdrawData');
    }

    if (isWithdrawComplexTransactionData(withdrawData)) {
      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message: 'Execution is planned in another network. No need to estimate',
        data: {
          fromNetwork: this.network,
          toNetwork: withdrawToNetwork,
          transactionData: withdrawData
        }
      });
      return { error: false, approveGasLimit: '0', actionGasLimit: '0' };
    }

    // if the withdrawToNetwork is the one where S+ exists,
    // and it is expected to be on-chain TX but current network
    // is not the target network
    if (this.network !== withdrawToNetwork) {
      throw new InvalidNetworkForOperationError(
        this.network,
        withdrawToNetwork
      );
    }

    addSentryBreadcrumb({
      type: 'debug',
      category: this.sentryCategoryPrefix,
      message: 'Execution is planned in current network',
      data: {
        transactionData: withdrawData
      }
    });

    if (this.centralTransferProxyContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings Plus withdraw',
        this.network
      );
    }

    try {
      const gasLimit = await this.centralTransferProxyContract.methods
        .withdrawFromPool(
          withdrawData.withdrawPoolAddress,
          toWei(outputAmount, outputAsset.decimals)
        )
        .estimateGas({ from: this.currentAddress });

      return {
        error: false,
        approveGasLimit: '0',
        actionGasLimit: this.addGasBuffer(gasLimit)
      };
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate withdraw',
        data: {
          error,
          outputAsset,
          outputAmount,
          withdrawData
        }
      });

      throw new OnChainServiceError('Failed to estimate withdraw').wrap(error);
    }
  }

  public async withdrawCompound(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    withdrawToNetwork: Network,
    changeStepToProcess: () => Promise<void>,
    withdrawData?: WithdrawTransactionData,
    gasLimit?: string
  ): Promise<TransactionReceipt | undefined> {
    if (!this.isValidUSDCishToken(outputAsset.address)) {
      throw new OnChainServiceError(
        'Wrong token supplied to withdrawCompound(). Output asset must be USDC-ish',
        {
          outputAsset
        }
      );
    }

    if (withdrawData === undefined) {
      throw new OnChainServiceError('Failed to withdraw: missing withdrawData');
    }

    if (isWithdrawComplexTransactionData(withdrawData)) {
      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message: 'Execution is planned in another network',
        data: {
          fromNetwork: this.network,
          toNetwork: withdrawToNetwork,
          transactionData: withdrawData
        }
      });

      try {
        return await this.withdrawComplex(
          outputAsset,
          outputAmount,
          withdrawToNetwork,
          changeStepToProcess
        );
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to withdraw (backend execution failed)',
          data: {
            error,
            outputAsset,
            outputAmount,
            withdrawToNetwork,
            withdrawData,
            gasLimit
          }
        });

        throw new OnChainServiceError('Failed to withdraw').wrap(error);
      }
    }

    if (this.network !== withdrawToNetwork) {
      throw new InvalidNetworkForOperationError(
        this.network,
        withdrawToNetwork
      );
    }

    if (gasLimit === undefined) {
      throw new OnChainServiceError(
        'Failed to withdraw: Transaction should be executed in the same bridge but no gasLimit provided',
        {
          network: this.network
        }
      );
    }

    addSentryBreadcrumb({
      type: 'debug',
      category: this.sentryCategoryPrefix,
      message: 'Execution is planned in current network',
      data: {
        outputAsset,
        outputAmount,
        gasLimit,
        transactionData: withdrawData
      }
    });

    try {
      return await this.withdraw(
        outputAsset,
        outputAmount,
        withdrawData,
        changeStepToProcess,
        gasLimit
      );
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to withdraw (same network tx execution failed)',
        data: {
          error,
          outputAsset,
          outputAmount,
          withdrawToNetwork,
          withdrawData,
          gasLimit
        }
      });

      throw new OnChainServiceError('Failed to withdraw').wrap(error);
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
    depositData: DepositWithBridgeTransactionData
  ): Promise<CompoundEstimateResponse> {
    if (this.centralTransferProxyContract === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'Savings Plus deposit',
        this.network
      );
    }

    if (transferData === undefined) {
      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message:
          'transferData is undefined. Estimate bridgeAsset instead of swapBridgeAsset',
        data: {
          inputAsset,
          outputAsset,
          transferData,
          depositData
        }
      });

      const gasLimitObj = await this.centralTransferProxyContract.methods
        .bridgeAsset(
          this.substituteAssetAddressIfNeeded(outputAsset.address),
          toWei(inputAmount, inputAsset.decimals),
          this.mapDepositDataToBytes(depositData),
          depositData.targetChainRelay
        )
        .estimateGas({ from: this.currentAddress });

      return {
        error: false,
        approveGasLimit: '0',
        actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
      };
    }

    addSentryBreadcrumb({
      type: 'debug',
      category: this.sentryCategoryPrefix,
      message:
        'transferData is not undefined so additional swap is needed. Estimate swapBridgeAsset instead of bridgeAsset',
      data: {
        inputAsset,
        outputAsset,
        transferData,
        depositData
      }
    });

    if (this.network === Network.mainnet) {
      const additionalParams = this.mapAdditionalSwapBridgeParams(
        transferData,
        depositData
      );

      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message:
          'Using different signature with minToMint and minDy as current network is mainnet',
        data: additionalParams
      });

      const gasLimitObj = await this.centralTransferProxyContract.methods
        .swapBridgeAsset(
          this.substituteAssetAddressIfNeeded(inputAsset.address),
          outputAsset.address,
          toWei(inputAmount, inputAsset.decimals),
          additionalParams._expectedMinimumReceived,
          this.mapTransferDataToBytes(transferData),
          this.mapDepositDataToBytes(depositData),
          depositData.targetChainRelay,
          additionalParams._minToMint,
          additionalParams._minDy
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

    const gasLimitObj = await this.centralTransferProxyContract.methods
      .swapBridgeAsset(
        this.substituteAssetAddressIfNeeded(inputAsset.address),
        outputAsset.address,
        toWei(inputAmount, inputAsset.decimals),
        this.mapTransferDataToExpectedMinimumAmount(transferData),
        this.mapTransferDataToBytes(transferData),
        this.mapDepositDataToBytes(depositData),
        depositData.targetChainRelay
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
    transferData: TransferData | undefined,
    depositData: DepositOnlyTransactionData,
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
    transferData: TransferData | undefined,
    depositData: DepositWithBridgeTransactionData,
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

      if (transferData === undefined) {
        addSentryBreadcrumb({
          type: 'debug',
          category: this.sentryCategoryPrefix,
          message:
            'transferData is undefined. Execute bridgeAsset instead of swapBridgeAsset',
          data: {
            inputAsset,
            outputAsset,
            transferData,
            depositData
          }
        });

        this.wrapWithSendMethodCallbacks(
          this.centralTransferProxyContract.methods
            .bridgeAsset(
              this.substituteAssetAddressIfNeeded(outputAsset.address),
              toWei(inputAmount, inputAsset.decimals),
              this.mapDepositDataToBytes(depositData),
              depositData.targetChainRelay
            )
            .send(this.getDefaultTransactionsParams(gasLimit)),
          resolve,
          reject,
          changeStepToProcess
        );

        return;
      }

      addSentryBreadcrumb({
        type: 'debug',
        category: this.sentryCategoryPrefix,
        message:
          'transferData is not undefined so additional swap is needed. Execute swapBridgeAsset instead of bridgeAsset',
        data: {
          inputAsset,
          outputAsset,
          transferData,
          depositData
        }
      });

      if (this.network === Network.mainnet) {
        const additionalParams = this.mapAdditionalSwapBridgeParams(
          transferData,
          depositData
        );

        addSentryBreadcrumb({
          type: 'debug',
          category: this.sentryCategoryPrefix,
          message:
            'Using different signature with minToMint and minDy as current network is mainnet',
          data: additionalParams
        });

        this.wrapWithSendMethodCallbacks(
          this.centralTransferProxyContract.methods
            .swapBridgeAsset(
              this.substituteAssetAddressIfNeeded(inputAsset.address),
              this.substituteAssetAddressIfNeeded(outputAsset.address),
              toWei(inputAmount, inputAsset.decimals),
              additionalParams._expectedMinimumReceived,
              this.mapTransferDataToBytes(transferData),
              this.mapDepositDataToBytes(depositData),
              depositData.targetChainRelay,
              additionalParams._minToMint,
              additionalParams._minDy
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
        return;
      }

      this.wrapWithSendMethodCallbacks(
        this.centralTransferProxyContract.methods
          .swapBridgeAsset(
            this.substituteAssetAddressIfNeeded(inputAsset.address),
            this.substituteAssetAddressIfNeeded(outputAsset.address),
            toWei(inputAmount, inputAsset.decimals),
            this.mapTransferDataToExpectedMinimumAmount(transferData),
            this.mapTransferDataToBytes(transferData),
            this.mapDepositDataToBytes(depositData),
            depositData.targetChainRelay
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

  // todo: rework
  protected async withdrawComplex(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    withdrawToNetwork: Network,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt | undefined> {
    const chainId = getNetwork(withdrawToNetwork)?.chainId;
    if (chainId === undefined) {
      throw new MoverError(
        `Failed to get chainId of network ${withdrawToNetwork}`
      );
    }

    const preparedAction = await this.prepareSavingsPlusComplexWithdrawAction(
      toWei(outputAmount, outputAsset.decimals),
      chainId
    );

    const subsidizedResponse =
      await this.subsidizedAPIService.executeSavingsPlusWithdrawTransaction(
        preparedAction.actionString,
        preparedAction.signature,
        changeStepToProcess
      );

    // todo: remove `Network.polygon` literal from here
    // and use an API service to check TX status
    // in a cross-chain manner
    if (this.network === Network.polygon) {
      const tx: Transaction = {
        blockNumber: '0',
        fee: {
          ethPrice: this.ethPriceGetterHandler?.() ?? '0',
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
        from: lookupAddress(withdrawToNetwork, 'HOLY_HAND_ADDRESS'),
        to: this.currentAddress,
        subsidizedQueueId: subsidizedResponse.queueID,
        moverType: 'withdraw_savings_plus_direct'
      };
      await this.addTransactionToStoreHandler?.(tx);

      return waitOffchainTransactionReceipt(
        subsidizedResponse.queueID,
        subsidizedResponse.txID,
        this.web3Client
      );
    }

    const tx: Transaction = {
      blockNumber: '0',
      fee: {
        ethPrice: this.ethPriceGetterHandler?.() ?? '0',
        feeInWEI: '0'
      },
      hash: '',
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
      moverType: 'withdraw_savings_plus_bridged'
    };
    await this.addTransactionToStoreHandler?.(tx);
  }

  protected async withdraw(
    outputAsset: SmallTokenInfo,
    outputAmount: string,
    withdrawData: WithdrawOnlyTransactionData,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt | never> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.centralTransferProxyContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Savings Plus withdraw',
          this.network
        );
      }

      this.wrapWithSendMethodCallbacks(
        this.centralTransferProxyContract.methods
          .withdrawFromPool(
            withdrawData.withdrawPoolAddress,
            toWei(outputAmount, outputAsset.decimals)
          )
          .send(this.getDefaultTransactionsParams(gasLimit)),
        resolve,
        reject,
        changeStepToProcess,
        {
          outputAsset,
          outputAmount,
          withdrawData,
          gasLimit
        }
      );
    });
  }

  protected isValidUSDCishToken(address: string): boolean {
    return sameAddress(address, this.usdcAssetData.address);
  }

  protected mapDepositDataToBytes(
    data?: DepositWithBridgeTransactionData
  ): number[] {
    return SavingsPlusOnChainService.mapDepositDataToBytes(
      this.web3Client,
      data
    );
  }

  protected static mapDepositDataToBytes(
    web3Client: Web3,
    data?: DepositWithBridgeTransactionData
  ): number[] {
    if (data === undefined) {
      return [];
    }

    return Array.prototype.concat(
      web3Client.utils.hexToBytes(data.bridgeTxAddress),
      web3Client.utils.hexToBytes(data.bridgeTxData)
    );
  }

  protected async prepareSavingsPlusComplexWithdrawAction(
    amount: string,
    chainId: number
  ): Promise<PreparedAction> {
    return this.prepareSubsidizedAction(
      `ON BEHALF ${
        this.currentAddress
      } TIMESTAMP ${dayjs().unix()} EXECUTE WITHDRAW FROM SAVINGSPLUS AMOUNT_TOKEN ${amount} TO NETWORK ${chainId}`
    );
  }

  protected mapAdditionalSwapBridgeParams(
    transferData: TransferData,
    depositData: DepositWithBridgeTransactionData
  ): { _expectedMinimumReceived: string; _minToMint: string; _minDy: string } {
    const _expectedMinimumReceived =
      this.mapTransferDataToExpectedMinimumAmount(transferData);
    const _minToMint = getInteger(
      multiply(
        _expectedMinimumReceived,
        SavingsPlusOnChainService.MintMultiplier
      )
    );
    const _minDy = getInteger(
      multiply(
        sub(_minToMint, depositData.bridgeFee),
        SavingsPlusOnChainService.DyMultiplier
      )
    );

    return { _expectedMinimumReceived, _minToMint, _minDy };
  }
}
