import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';

import { MoverError, NetworkFeatureNotSupportedError } from '@/services/v2';
import { TokenPriceService } from '@/services/v2/api/price';
import { SwapAPIService, TransferData } from '@/services/v2/api/swap';
import { OnChainServiceError } from '@/services/v2/on-chain';
import {
  CompoundEstimateWithUnwrapResponse,
  MoverOnChainService
} from '@/services/v2/on-chain/mover';
import {
  HolyHandContract,
  UnwrappedData,
  WrappedData
} from '@/services/v2/on-chain/mover/types';
import { WrappedTokenDCult } from '@/services/v2/on-chain/wrapped-tokens/dCULT/token';
import { WrappedTokenGALCX } from '@/services/v2/on-chain/wrapped-tokens/gALCX/token';
import { WrappedTokenIdle } from '@/services/v2/on-chain/wrapped-tokens/idle/token';
import { WrappedToken } from '@/services/v2/on-chain/wrapped-tokens/WrappedToken';
import { WrappedTokenWXBTRFLY } from '@/services/v2/on-chain/wrapped-tokens/wxBTRFLY/token';
import { WrappedTokenYearn } from '@/services/v2/on-chain/wrapped-tokens/yearn/token';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { NativeCurrency } from '@/store/modules/account/types';
import { sameAddress } from '@/utils/address';
import { fromWei, getInteger, greaterThan, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getCentralTransferProxyAbi,
  getEURSAssetData,
  getSlippage,
  getUSDCAssetData,
  lookupAddress
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { addresses as idleTokenAddresses } from '@/wallet/references/idleTokensData';
import { addresses as yearnSimpleVaultAddresses } from '@/wallet/references/yearnVaultsData';
import { SmallToken, SmallTokenInfo, Token } from '@/wallet/types';

import { LoaderStep } from '@/components/forms';

export class DebitCardOnChainService extends MoverOnChainService {
  protected readonly sentryCategoryPrefix = 'debit-card.on-chain.service';
  specialTokenHandlers: Array<WrappedToken> = [];
  swapService: SwapAPIService;
  protected readonly usdcAssetData: SmallTokenInfo;
  protected readonly eursAssetData: SmallTokenInfo;
  protected readonly centralTransferProxyAddress: string;
  protected readonly centralTransferProxyContract: HolyHandContract | undefined;
  protected readonly tokenPriceService: TokenPriceService;

  constructor(
    currentAddress: string,
    network: Network,
    web3Client: Web3,
    protected readonly currency: NativeCurrency,
    protected readonly getWalletTokens: () => Array<Token>
  ) {
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

    this.tokenPriceService = new TokenPriceService(currentAddress, network);

    for (const [n, vaults] of Object.entries(yearnSimpleVaultAddresses)) {
      for (const vault of vaults) {
        this.specialTokenHandlers.push(
          new WrappedTokenYearn(
            vault.vaultToken.address,
            this.currentAddress,
            n as Network,
            this.web3Client
          )
        );
      }
    }

    for (const [n, idleTokens] of Object.entries(idleTokenAddresses)) {
      for (const idleToken of idleTokens) {
        this.specialTokenHandlers.push(
          new WrappedTokenIdle(
            idleToken.wrapToken.address,
            this.currentAddress,
            n as Network,
            this.web3Client
          )
        );
      }
    }

    this.specialTokenHandlers.push(
      new WrappedTokenWXBTRFLY(
        this.currentAddress,
        Network.mainnet,
        this.web3Client
      )
    );
    this.specialTokenHandlers.push(
      new WrappedTokenDCult(
        this.currentAddress,
        Network.mainnet,
        this.web3Client
      )
    );
    this.specialTokenHandlers.push(
      new WrappedTokenGALCX(
        this.currentAddress,
        Network.mainnet,
        this.web3Client
      )
    );
  }

  public getUnwrappedToken(inputAsset: SmallToken): SmallToken {
    const specialTokenHandler = this.specialTokenHandlers.find((h) =>
      h.canHandle(inputAsset.address, this.network)
    );

    if (specialTokenHandler !== undefined) {
      return specialTokenHandler.getUnwrappedToken();
    }

    return inputAsset;
  }

  /**
   * return price of the unwrapped token (return input price in case of simple token)
   * throws exception in case of price is unavailable
   * @param inputAsset
   * @param inputAssetPrice
   */
  public async getUnwrappedTokenPrice(
    inputAsset: SmallToken,
    inputAssetPrice: string
  ): Promise<string> {
    const specialTokenHandler = this.specialTokenHandlers.find((h) =>
      h.canHandle(inputAsset.address, this.network)
    );

    if (specialTokenHandler !== undefined) {
      const unwrappedTokenPrice = await this.getPriceByAddress(
        specialTokenHandler.getUnwrappedToken().address
      );
      return unwrappedTokenPrice;
    }

    return inputAssetPrice;
  }

  public async getUnwrappedData(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    inputAssetPrice: string
  ): Promise<UnwrappedData> {
    const specialTokenHandler = this.specialTokenHandlers.find((h) =>
      h.canHandle(inputAsset.address, this.network)
    );

    if (specialTokenHandler === undefined) {
      return {
        unwrappedToken: inputAsset,
        amountInWei: toWei(inputAmount, inputAsset.decimals),
        unwrappedTokenPrice: inputAssetPrice
      };
    }

    const newAmount = await specialTokenHandler.getUnwrappedAmount(inputAmount);
    const unwrappedToken = specialTokenHandler.getUnwrappedToken();

    let unwrappedTokenPrice = '0';
    try {
      unwrappedTokenPrice = await this.getPriceByAddress(
        unwrappedToken.address
      );
    } catch (e) {
      addSentryBreadcrumb({
        type: 'error',
        category: `${this.sentryCategoryPrefix}.getUnwrappedData`,
        message: 'can not get unwrapped token price, return zero',
        data: {
          error: e,
          assetAddress: unwrappedToken.address
        }
      });
    }

    return {
      unwrappedToken: unwrappedToken,
      amountInWei: getInteger(toWei(newAmount, unwrappedToken.decimals)),
      unwrappedTokenPrice: unwrappedTokenPrice
    };
  }

  public async getWrappedDataByUnwrapped(
    wrappedAsset: SmallTokenInfo,
    unwrappedAsset: SmallTokenInfo,
    unwrappedAmount: string
  ): Promise<WrappedData> {
    const specialTokenHandler = this.specialTokenHandlers.find((h) =>
      h.canHandle(wrappedAsset.address, this.network)
    );

    if (specialTokenHandler === undefined) {
      // unwrappedAsset should be equal to wrappedAsset
      return {
        wrappedToken: unwrappedAsset,
        amountInWei: toWei(unwrappedAmount, unwrappedAsset.decimals)
      };
    }

    const newAmount = await specialTokenHandler.getWrappedAmountByUnwrapped(
      unwrappedAmount
    );

    return {
      wrappedToken: wrappedAsset,
      amountInWei: getInteger(toWei(newAmount, wrappedAsset.decimals))
    };
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
          inputAmount
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

  protected async getPriceByAddress(tokenAddress: string): Promise<string> {
    const walletTokens = this.getWalletTokens();
    const inWalletToken = walletTokens.find((t) =>
      sameAddress(tokenAddress, t.address)
    );
    if (
      inWalletToken !== undefined &&
      greaterThan(inWalletToken.priceUSD, '0')
    ) {
      return inWalletToken.priceUSD;
    }

    try {
      const price = await this.tokenPriceService.getPriceByContractAddress(
        tokenAddress,
        this.currency
      );

      return price;
    } catch (err) {
      addSentryBreadcrumb({
        type: 'error',
        category: `${this.sentryCategoryPrefix}.getPriceByAddress`,
        message: 'Failed to get token price from token price',
        data: {
          tokenAddress,
          currency: this.currency
        }
      });
      throw new MoverError('Can not get token price', {
        tokenAddress,
        currency: this.currency
      });
    }
  }
}
