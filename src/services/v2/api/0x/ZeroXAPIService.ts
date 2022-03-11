import VueI18n from 'vue-i18n';

import * as Sentry from '@sentry/vue';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';

import { TransferData } from '@/services/0x/api';
import { MoverError, NetworkFeatureNotSupportedError } from '@/services/v2';
import { MultiChainAPIService } from '@/services/v2/api';
import { greaterThan, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';

import {
  GeneralErrorCode,
  ResponseHTTPErrorCode,
  SwapQuoteParams,
  SwapQuoteResponse,
  ZeroXBadRequestResponse
} from './types';

/**
 * A wrapper class for interacting with 0x.org API
 * @see https://0x.org/docs/api
 */
export class ZeroXAPIService extends MultiChainAPIService {
  protected baseURL: string;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = '0x.api.service';
  protected static readonly validNetworks: Array<Network> = [
    Network.mainnet,
    Network.binance,
    Network.ropsten,
    Network.polygon,
    Network.avalanche,
    Network.fantom,
    Network.celo,
    Network.optimism
  ];
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

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL(network);
    this.client = this.applyAxiosInterceptors(
      axios.create({
        baseURL: this.baseURL,
        paramsSerializer: this.getParamsSerializer,
        headers: {
          Accept: 'application/json'
        },
        validateStatus: (status) => status === 200
      })
    );
  }

  /**
   * @deprecated
   */
  public async getTransferData(
    buyTokenAddress: string,
    sellTokenAddress: string,
    rawAmount: string,
    isInputAmount = true,
    slippage: string
  ): Promise<TransferData> {
    const slippageFromPercents = multiply(slippage, '0.01');

    const base: Omit<SwapQuoteParams, 'sellAmount' | 'buyAmount'> = {
      buyToken: buyTokenAddress,
      sellToken: sellTokenAddress,
      slippagePercentage: slippageFromPercents
    };

    let requestPromise;
    if (isInputAmount) {
      requestPromise = this.getSwapQuote({
        ...base,
        sellAmount: rawAmount
      });
    } else {
      requestPromise = this.getSwapQuote({
        ...base,
        buyAmount: rawAmount
      });
    }

    return this.mapSwapQuote(await requestPromise);
  }

  /**
   * Requests swap quote with all the estimations needed
   * @param params
   */
  public async getSwapQuote(
    params: SwapQuoteParams
  ): Promise<SwapQuoteResponse> {
    if (!ZeroXAPIService.ensureNetworkIsSupported(this.network)) {
      throw new NetworkFeatureNotSupportedError('0x swaps', this.network);
    }

    return (
      await this.client.get<SwapQuoteResponse>('/swap/v1/quote', { params })
    ).data;
  }

  public formatSwapSources = (swapSource: string): string =>
    ZeroXAPIService.formatSwapSources(swapSource);

  public static formatSwapSources = (swapSource: string): string => {
    return ZeroXAPIService.swapSourceIcons[swapSource]
      ? `${swapSource} ${ZeroXAPIService.swapSourceIcons[swapSource]}`
      : swapSource;
  };

  public mapErrorMessage = (message: string, i18n?: VueI18n): string =>
    ZeroXAPIService.mapErrorMessage(message, i18n);

  public static mapErrorMessage(message: string, i18n?: VueI18n): string {
    if (i18n === undefined) {
      return message;
    }

    if (i18n.te(`swaps.errors.${message}`)) {
      return i18n.t(`swaps.errors.${message}`) as string;
    }

    return message;
  }

  protected mapSwapQuote(data: SwapQuoteResponse): TransferData {
    const via = data.sources.find((s) => greaterThan(s.proportion, 0)) ?? {
      name: ''
    };

    return {
      allowanceTarget: data.allowanceTarget,
      buyAmount: data.buyAmount,
      data: data.data,
      sellAmount: data.sellAmount,
      to: data.to,
      value: data.value,
      swappingVia: via.name,
      buyTokenToEthRate: data.buyTokenToEthRate,
      sellTokenToEthRate: data.sellTokenToEthRate
    };
  }

  protected formatError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      Sentry.addBreadcrumb(this.formatAxiosErrorSentryBreadcrumb(error));

      if (error.response !== undefined) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data === undefined) {
          Sentry.addBreadcrumb({
            type: 'error',
            message: 'API responded with an error',
            category: this.sentryCategoryPrefix,
            data: {
              error: 'no data available',
              axiosError: error
            }
          });

          throw new MoverError(error.message).wrap(error); // no data available
        }

        if (error.response.status === ResponseHTTPErrorCode.BadRequest) {
          // handle and log bad request responses differently
          throw this.formatBadRequestResponse(error.response);
        }

        Sentry.addBreadcrumb({
          type: 'error',
          message: 'API responded with an error',
          category: this.sentryCategoryPrefix,
          data: {
            error
          }
        });

        throw new MoverError(error.message, error.response.data).wrap(error);
      } else if (error.request !== undefined) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest
        Sentry.addBreadcrumb({
          type: 'error',
          message: 'API responded with an error',
          category: this.sentryCategoryPrefix,
          data: {
            error: 'no response received',
            axiosError: error
          }
        });

        throw new MoverError(
          'The request is failed, no response',
          error.request
        ).wrap(error);
      }
    }

    Sentry.addBreadcrumb({
      type: 'error',
      message: 'API responded with an error',
      category: this.sentryCategoryPrefix,
      data: {
        error: 'the request is failed during setup',
        originalError: error
      }
    });

    // Something happened in setting up the request that triggered an Error
    // or result handling went wrong

    if (error instanceof Error) {
      // An error is JS-initiated error, just pass it through
      throw new MoverError('The request is failed').wrap(error);
    }

    throw new MoverError(
      `The request is failed during setup / result handling`,
      { data: error }
    );
  }

  protected applyAxiosInterceptors(instance: AxiosInstance): AxiosInstance {
    axiosRetry(instance, {
      retries: 3,
      retryCondition: (error: AxiosError) =>
        axiosRetry.isIdempotentRequestError(error) &&
        error.response?.status === ResponseHTTPErrorCode.TooManyRequests
    });

    instance.interceptors.response.use(undefined, this.formatError.bind(this));

    return instance;
  }

  private formatAxiosErrorSentryBreadcrumb(
    axiosError: AxiosError<unknown>
  ): Sentry.Breadcrumb {
    const requestUri = axios.getUri(axiosError.config);
    const code = axiosError.code;

    return {
      message: 'A request to the API is failed',
      category: this.sentryCategoryPrefix,
      data: {
        requestUri,
        code,
        axiosError
      }
    };
  }

  protected formatBadRequestResponse(
    response: AxiosResponse<ZeroXBadRequestResponse>
  ): never {
    Sentry.addBreadcrumb({
      type: 'error',
      category: this.sentryCategoryPrefix,
      message: `Request failed with code ${response.status} (${response.statusText}): ${response.data.reason}`,
      data: {
        reason: response.data.reason,
        code: response.data.code,
        validationErrors: response.data.validationErrors
      }
    });

    if (response.data.code === GeneralErrorCode.ValidationFailed) {
      const validationErrorString =
        response.data.validationErrors?.[0].reason ?? response.data.reason;
      throw new MoverError(validationErrorString, response.data);
    }

    throw new MoverError(response.data.reason, response.data);
  }

  protected static ensureNetworkIsSupported(network?: Network): boolean {
    if (network === undefined) {
      return false;
    }

    return ZeroXAPIService.validNetworks.includes(network);
  }

  protected lookupBaseURL(network?: Network): string {
    switch (network) {
      case Network.binance:
        return 'https://bsc.api.0x.org';
      case Network.ropsten:
        return 'https://ropsten.api.0x.org';
      case Network.polygon:
        return 'https://polygon.api.0x.org';
      case Network.avalanche:
        return 'https://avalanche.api.0x.org';
      case Network.fantom:
        return 'https://fantom.api.0x.org';
      case Network.celo:
        return 'https://celo.api.0x.org';
      case Network.optimism:
        return 'https://optimism.api.0x.org';
      case Network.mainnet:
      default:
        return 'https://api.0x.org';
    }
  }
}
