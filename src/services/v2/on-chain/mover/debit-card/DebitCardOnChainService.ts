import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { SwapAPIService, TransferData } from '@/services/v2/api/swap';
import { OnChainServiceError } from '@/services/v2/on-chain';
import {
  CompoundEstimateWithUnwrapResponse,
  MoverOnChainService
} from '@/services/v2/on-chain/mover';
import { HolyHandContract } from '@/services/v2/on-chain/mover/types';
import { WrappedTokenDCult } from '@/services/v2/on-chain/wrapped-tokens/dCULT/token';
import { WrappedTokenGALCX } from '@/services/v2/on-chain/wrapped-tokens/gALCX/token';
import { WrappedToken } from '@/services/v2/on-chain/wrapped-tokens/WrappedToken';
import { WrappedTokenWXBTRFLY } from '@/services/v2/on-chain/wrapped-tokens/wxBTRFLY/token';
import { WrappedTokenYearn } from '@/services/v2/on-chain/wrapped-tokens/yearn/token';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { fromWei, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getCentralTransferProxyAbi,
  getEURSAssetData,
  getSlippage,
  getUSDCAssetData,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { addresses as yearnSimpleVaultAddresses } from '@/wallet/references/yearnVaultsData';
import { SmallToken, SmallTokenInfo } from '@/wallet/types';

import { LoaderStep } from '@/components/forms';

export class DebitCardOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'debit-card.on-chain.service';
  specialTokenHandlers: Array<WrappedToken> = [];
  swapService: SwapAPIService;
  protected readonly usdcAssetData: SmallTokenInfo;
  protected readonly eursAssetData: SmallTokenInfo;
  protected readonly centralTransferProxyAddress: string;
  protected readonly centralTransferProxyContract: HolyHandContract | undefined;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);
    this.swapService = new SwapAPIService(currentAddress, network);
    this.usdcAssetData = getUSDCAssetData(network);
    this.eursAssetData = getEURSAssetData(network);
    this.centralTransferProxyAddress = lookupAddress(
      network,
      'HOLY_HAND_ADDRESS'
    );
    this.centralTransferProxyContract = this.createContract(
      'HOLY_HAND_ADDRESS',
      getCentralTransferProxyAbi(network)
    );

    for (const [n, vaults] of Object.entries(yearnSimpleVaultAddresses)) {
      for (const vault of vaults) {
        this.specialTokenHandlers.push(
          new WrappedTokenYearn(vault.vaultToken.address, n as Network)
        );
      }
    }

    this.specialTokenHandlers.push(new WrappedTokenWXBTRFLY(Network.mainnet));
    this.specialTokenHandlers.push(new WrappedTokenDCult(Network.mainnet));
    this.specialTokenHandlers.push(new WrappedTokenGALCX(Network.mainnet));
  }

  public getUnwrappedToken(inputAsset: SmallToken): SmallToken | undefined {
    const specialTokenHandler = this.specialTokenHandlers.find((h) =>
      h.canHandle(inputAsset.address, this.network)
    );

    if (specialTokenHandler !== undefined) {
      return specialTokenHandler.getUnwrappedToken();
    }

    return undefined;
  }

  public async estimateTopUpCompound(
    inputAsset: SmallToken,
    inputAmount: string,
    transferData: TransferData | undefined
  ): Promise<CompoundEstimateWithUnwrapResponse> {
    if (this.centralTransferProxyContract === undefined) {
      throw new NetworkFeatureNotSupportedError('Card Top Up', this.network);
    }

    const specialTokenHandler = this.specialTokenHandlers.find((h) =>
      h.canHandle(inputAsset.address, this.network)
    );

    if (specialTokenHandler !== undefined) {
      addSentryBreadcrumb({
        type: 'info',
        category: `${this.sentryCategoryPrefix}.estimateTopUpCompound`,
        message: 'Special token',
        data: {
          inputAsset: inputAsset,
          unwrapTo: specialTokenHandler.getUnwrappedToken().symbol
        }
      });

      let estimation;
      try {
        estimation = await specialTokenHandler.estimateUnwrap(
          inputAsset,
          inputAmount,
          this.web3Client,
          this.currentAddress
        );
      } catch (error) {
        addSentryBreadcrumb({
          type: 'error',
          category: `${this.sentryCategoryPrefix}.estimateTopUpCompound`,
          message: 'failed to estimate unwrap',
          data: {
            error
          }
        });

        throw new OnChainServiceError('Failed to estimate top up').wrap(error);
      }

      return {
        error: false,
        actionGasLimit: ethDefaults.basic_move_card_top_up,
        approveGasLimit: ethDefaults.basic_approval,
        unwrapGasLimit: estimation.gasLimit
      };
    }

    if (
      !sameAddress(inputAsset.address, this.usdcAssetData.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError(
        'Failed to estimate top up: missing transferData'
      );
    }

    const approveGasLimit = await this.estimateApproveIfNeeded(
      inputAsset,
      inputAmount,
      this.centralTransferProxyAddress
    );

    if (approveGasLimit !== undefined) {
      return {
        error: false,
        actionGasLimit: ethDefaults.basic_move_card_top_up,
        approveGasLimit: approveGasLimit,
        unwrapGasLimit: '0'
      };
    }

    try {
      const gasLimitObj = await this.centralTransferProxyContract.methods
        .cardTopUp(
          this.currentAddress,
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
          unwrapGasLimit: '0',
          actionGasLimit: this.addGasBuffer(gasLimitObj.toString())
        };
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: `${this.sentryCategoryPrefix}.estimateTopUpCompound`,
        message: 'Failed to estimate top up',
        data: {
          error,
          inputAsset,
          inputAmount,
          transferData
        }
      });

      throw new OnChainServiceError('Failed to estimate top up').wrap(error);
    }

    addSentryBreadcrumb({
      type: 'error',
      category: `${this.sentryCategoryPrefix}.estimateTopUpCompound`,
      message: 'Failed to estimate top up: empty gas limit',
      data: {
        inputAsset,
        inputAmount,
        transferData
      }
    });

    throw new OnChainServiceError('Failed to estimate top up: empty gas limit');
  }

  public async topUpCompound(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    changeStep: (step: LoaderStep) => Promise<void>,
    actionGasLimit: string,
    approveGasLimit: string,
    unwrapGasLimit: string
  ): Promise<TransactionReceipt> {
    const specialTokenHandler = this.specialTokenHandlers.find((h) =>
      h.canHandle(inputAsset.address, this.network)
    );
    if (specialTokenHandler !== undefined) {
      const inputAmountInWei = await specialTokenHandler.unwrap(
        inputAsset,
        inputAmount,
        this.web3Client,
        this.currentAddress,
        () => changeStep('Process'),
        unwrapGasLimit
      );
      inputAsset = specialTokenHandler.getUnwrappedToken();
      inputAmount = fromWei(inputAmountInWei, inputAsset.decimals);

      if (!sameAddress(inputAsset.address, this.usdcAssetData.address)) {
        transferData = await this.swapService.getTransferData(
          this.usdcAssetData.address,
          inputAsset.address,
          inputAmountInWei,
          true,
          getSlippage(inputAsset.address, this.network)
        );
      } else {
        transferData = undefined;
      }

      const estimation = await this.estimateTopUpCompound(
        inputAsset,
        inputAmount,
        transferData
      );

      actionGasLimit = estimation.actionGasLimit;
      approveGasLimit = estimation.approveGasLimit;
    }

    await changeStep('Confirm');

    return await this.executeTransactionWithApprove(
      inputAsset,
      this.centralTransferProxyAddress,
      inputAmount,
      async (newGasLimit) =>
        this.topUp(
          inputAsset,
          inputAmount,
          transferData,
          () => changeStep('Process'),
          newGasLimit
        ),
      () => this.estimateTopUpCompound(inputAsset, inputAmount, transferData),
      () => changeStep('Process'),
      approveGasLimit,
      actionGasLimit
    );
  }

  protected async topUp(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    transferData: TransferData | undefined,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<TransactionReceipt> {
    if (
      !sameAddress(inputAsset.address, this.usdcAssetData.address) &&
      transferData === undefined
    ) {
      throw new OnChainServiceError(
        'Failed to execute Top Up: missing transferData'
      );
    }

    return new Promise<TransactionReceipt>((resolve, reject) => {
      if (this.centralTransferProxyContract === undefined) {
        throw new NetworkFeatureNotSupportedError('Card Top Up', this.network);
      }

      this.wrapWithSendMethodCallbacks(
        this.centralTransferProxyContract.methods
          .cardTopUp(
            this.currentAddress,
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
}
