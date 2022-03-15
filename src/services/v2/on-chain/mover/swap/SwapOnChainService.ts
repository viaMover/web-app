import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { TransferData } from '@/services/v2/api/0x';
import { MoverAPISubsidizedRequestError } from '@/services/v2/api/mover/subsidized';
import { OnChainServiceError } from '@/services/v2/on-chain';
import {
  CompoundEstimateResponse,
  MoverOnChainService
} from '@/services/v2/on-chain/mover';
import { PreparedAction } from '@/services/v2/on-chain/mover/subsidized';
import { HolyHandContract } from '@/services/v2/on-chain/mover/types';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';
import { waitOffchainTransactionReceipt } from '@/wallet/offchainExplorer';
import { HOLY_HAND_ABI, lookupAddress } from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, Transaction, TransactionTypes } from '@/wallet/types';

export class SwapOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'swap.on-chain.service';
  protected readonly holyHandContract: HolyHandContract | undefined;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.holyHandContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      HOLY_HAND_ABI as AbiItem[]
    );
  }

  public async swapCompound(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData,
    swapGasLimit: string,
    approveGasLimit: string,
    gasPriceInGwei: string,
    useSubsidized: boolean,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    try {
      return await this.executeTransactionWithApprove(
        inputAsset,
        lookupAddress(this.network, 'HOLY_HAND_ADDRESS'),
        inputAmount,
        async () => {
          if (useSubsidized) {
            return await this.swapSubsidized(
              inputAsset,
              outputAsset,
              inputAmount,
              transferData,
              changeStepToProcess
            );
          } else {
            return await this.swap(
              inputAsset,
              outputAsset,
              inputAmount,
              transferData,
              swapGasLimit,
              gasPriceInGwei,
              changeStepToProcess
            );
          }
        },
        changeStepToProcess,
        approveGasLimit
      );
    } catch (error) {
      if (error instanceof MoverAPISubsidizedRequestError) {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to execute subsidized swap',
          data: {
            error: error.message,
            description: error.shortMessage,
            payload: error.payload,
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            swapGasLimit,
            approveGasLimit,
            gasPriceInGwei,
            useSubsidized
          }
        });

        throw error;
      }

      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to swap',
        data: {
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          swapGasLimit,
          approveGasLimit,
          gasPriceInGwei,
          useSubsidized,
          error
        }
      });
      throw new OnChainServiceError('Failed to execute swap').wrap(error);
    }
  }

  public async estimateSwapCompound(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData
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
          actionGasLimit: ethDefaults.basic_holy_swap,
          approveGasLimit: approveGasLimit
        };
      } catch (error) {
        Sentry.addBreadcrumb({
          type: 'error',
          category: this.sentryCategoryPrefix,
          message: 'Failed to estimate swap: failed "approve" estimation',
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

    if (this.holyHandContract === undefined) {
      throw new NetworkFeatureNotSupportedError('Swaps', this.network);
    }

    try {
      const gasLimitObj = await this.holyHandContract.methods
        .executeSwap(
          this.substituteAssetAddressIfNeeded(inputAsset.address),
          this.substituteAssetAddressIfNeeded(outputAsset.address),
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

      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate swap: empty gas limit',
        data: {
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
    } catch (error) {
      Sentry.addBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to estimate swap',
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

  protected async swap(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData,
    gasLimit: string,
    gasPriceInGwei: string,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.holyHandContract === undefined) {
        throw new NetworkFeatureNotSupportedError('Swaps', this.network);
      }

      this.wrapWithSendMethodCallbacks(
        this.holyHandContract.methods
          .executeSwap(
            this.substituteAssetAddressIfNeeded(inputAsset.address),
            this.substituteAssetAddressIfNeeded(outputAsset.address),
            toWei(inputAmount, inputAsset.decimals),
            this.mapTransferDataToExpectedMinimumAmount(transferData),
            this.mapTransferDataToBytes(transferData)
          )
          .send({
            ...this.getDefaultTransactionsParams(
              gasLimit,
              this.mapTransferDataToValue(transferData)
            ),
            gasPrice: this.web3Client.utils
              .toWei(this.web3Client.utils.toBN(gasPriceInGwei), 'gwei')
              .toString()
          }),
        resolve,
        reject,
        changeStepToProcess,
        {
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          gasLimit,
          gasPriceInGwei
        }
      );
    });
  }

  protected async swapSubsidized(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData,
    changeStepToProcess: () => Promise<void>
  ): Promise<TransactionReceipt> {
    const preparedAction = await this.prepareSubsidizedSwapAction(
      inputAsset.address,
      outputAsset.address,
      toWei(inputAmount, inputAsset.decimals),
      this.mapTransferDataToExpectedMinimumAmount(transferData)
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
        ethPrice: this.ethPriceGetterHandler?.() ?? '0',
        feeInWEI: '0'
      },
      hash: subsidizedResponse.txID ?? '',
      isOffchain: true,
      nonce: '0',
      status: 'pending',
      timestamp: currentTimestamp(),
      type: TransactionTypes.swapERC20,
      uniqHash: subsidizedResponse.txID ? `${subsidizedResponse.txID}-0` : '',
      asset: {
        address: inputAsset.address,
        change: toWei(inputAmount, inputAsset.decimals),
        decimals: inputAsset.decimals,
        direction: 'out',
        iconURL: '',
        price: '0',
        symbol: inputAsset.symbol
      },
      subsidizedQueueId: subsidizedResponse.queueID,
      moverType: 'execute_swap'
    };
    await this.addTransactionToStoreHandler?.(tx);

    return waitOffchainTransactionReceipt(
      subsidizedResponse.queueID,
      subsidizedResponse.txID,
      this.web3Client
    );
  }

  protected async prepareSubsidizedSwapAction(
    tokenFromAddress: string,
    tokenToAddress: string,
    amount: string,
    expectedMinimum: string
  ): Promise<PreparedAction> {
    return this.prepareSubsidizedAction(
      `ON BEHALF ${
        this.currentAddress
      } TIMESTAMP ${dayjs().unix()} EXECUTE SWAP TOKEN_FROM ${tokenFromAddress} TOKEN_TO ${tokenToAddress} AMOUNT_FROM ${amount} EXPECTED_MINIMUM ${expectedMinimum}`
    );
  }
}
