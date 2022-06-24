import VueI18n from 'vue-i18n';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { ISwapper } from '@/services/v2/api/swap/ISwapper';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { Network } from '@/utils/networkTypes';

import { ZeroXAPIService } from './0x';
import { OneInchAPIService } from './1inch';
import { TransferData } from './types';

export class SwapAPIService {
  private sentryCategoryPrefix = 'swap.api.service';
  private executors = new Array<ISwapper>();

  constructor(
    private readonly currentAddress: string,
    private readonly network: Network
  ) {
    this.executors.push(new ZeroXAPIService(this.currentAddress, this.network));
    this.executors.push(
      new OneInchAPIService(this.currentAddress, this.network)
    );
  }

  public isBuyAmountAvailable(): boolean {
    const executor = this.executors.find((s) => s.canHandle(this.network));
    if (executor === undefined) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to find suitable swap executor',
        data: { network: this.network }
      });
      throw new NetworkFeatureNotSupportedError('Swaps', this.network);
    }
    return executor.isBuyAmountAvailable();
  }

  public async getTransferData(
    buyTokenAddress: string,
    sellTokenAddress: string,
    rawAmount: string,
    isInputAmount: boolean,
    slippage: string
  ): Promise<TransferData> {
    const executor = this.executors.find((s) => s.canHandle(this.network));
    if (executor === undefined) {
      addSentryBreadcrumb({
        type: 'error',
        category: this.sentryCategoryPrefix,
        message: 'Failed to find suitable swap executor',
        data: { network: this.network }
      });
      throw new NetworkFeatureNotSupportedError('Swaps', this.network);
    }

    addSentryBreadcrumb({
      type: 'debug',
      category: this.sentryCategoryPrefix,
      message: 'Using concrete swap executor',
      data: { name: executor.getName() }
    });

    return executor.getTransferData(
      buyTokenAddress,
      sellTokenAddress,
      rawAmount,
      isInputAmount,
      slippage
    );
  }

  public formatSwapSources = (swapSource: string): string =>
    SwapAPIService.formatSwapSources(swapSource);

  public static formatSwapSources = (swapSource: string): string => {
    return SwapAPIService.swapSourceIcons[swapSource]
      ? `${swapSource} ${SwapAPIService.swapSourceIcons[swapSource]}`
      : swapSource;
  };

  public mapErrorMessage = (message: string, i18n?: VueI18n): string =>
    SwapAPIService.mapErrorMessage(message, i18n);

  public static mapErrorMessage(message: string, i18n?: VueI18n): string {
    if (i18n === undefined) {
      return message;
    }

    if (i18n.te(`swaps.errors.${message}`)) {
      return i18n.t(`swaps.errors.${message}`) as string;
    }

    return message;
  }

  protected static readonly swapSourceIcons = {
    Uniswap_V2: '🦄',
    Curve: '🧮',
    Balancer: '⚖',
    Balancer_V2: '⚖',
    Bancor: '🕳',
    Mooniswap: '🌑',
    SnowSwap: '❄',
    SushiSwap: '🍣',
    'Shell Protocol': '🐚',
    DODO: '🐣',
    CREAM: '🍦',
    CryptoCom: '🪙',
    Uniswap_V3: '🦄',
    ShibaSwap: '🐕',
    OasisDEX: '🏝'
  } as Record<string, string>;
}
