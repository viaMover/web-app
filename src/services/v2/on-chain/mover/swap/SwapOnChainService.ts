import dayjs from 'dayjs';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { MoverAPISubsidizedRequestError } from '@/services/v2/api/mover/subsidized';
import { TransferData } from '@/services/v2/api/swap';
import { OnChainServiceError } from '@/services/v2/on-chain';
import {
  CompoundEstimateResponse,
  MoverOnChainService
} from '@/services/v2/on-chain/mover';
import { PreparedAction } from '@/services/v2/on-chain/mover/subsidized';
import { HolyHandContract } from '@/services/v2/on-chain/mover/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';
import { waitOffchainTransactionReceipt } from '@/wallet/offchainExplorer';
import {
  getCentralTransferProxyAbi,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, Transaction, TransactionTypes } from '@/wallet/types';

export class SwapOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'swap.on-chain.service';
  protected readonly holyHandContract: HolyHandContract | undefined;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.holyHandContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      getCentralTransferProxyAbi(network)
    );
  }

  public async swapCompound(
    inputAsset: SmallToken,
    outputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData,
    actionGasLimit: string,
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
        (newGasLimit) => {
          if (useSubsidized) {
            return this.swapSubsidized(
              inputAsset,
              outputAsset,
              inputAmount,
              transferData,
              changeStepToProcess
            );
          }

          return this.swap(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            newGasLimit,
            gasPriceInGwei,
            changeStepToProcess
          );
        },
        () =>
          this.estimateSwapCompound(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData
          ),
        changeStepToProcess,
        approveGasLimit,
        actionGasLimit
      );
    } catch (error) {
      if (error instanceof MoverAPISubsidizedRequestError) {
        addSentryBreadcrumb({
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
            swapGasLimit: actionGasLimit,
            approveGasLimit,
            gasPriceInGwei,
            useSubsidized
          }
        });

        throw error;
      }

      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to swap',
        data: {
          inputAsset,
          outputAsset,
          inputAmount,
          transferData,
          swapGasLimit: actionGasLimit,
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
    } catch (error) {
      console.error('failed to estimate swap', error);

      addSentryBreadcrumb({
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

      throw new OnChainServiceError('Failed to estimate swap').wrap(error);
    }

    addSentryBreadcrumb({
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

    throw new OnChainServiceError('Failed to estimate swap: empty gas limit');
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
            gasPrice: this.substituteGasPriceIfNeeded(
              this.web3Client.utils
                .toWei(this.web3Client.utils.toBN(gasPriceInGwei), 'gwei')
                .toString()
            )
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
      this.substituteAssetAddressIfNeeded(inputAsset.address),
      this.substituteAssetAddressIfNeeded(outputAsset.address),
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
