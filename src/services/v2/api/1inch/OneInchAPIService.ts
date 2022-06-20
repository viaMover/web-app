import * as Sentry from '@sentry/vue';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry, { exponentialDelay } from 'axios-retry';
import dayjs from 'dayjs';
import Web3 from 'web3';

import {
  MoverError,
  NetworkFeatureNotSupportedError,
  ResponseHTTPErrorCode
} from '@/services/v2';
import { MultiChainAPIService } from '@/services/v2/api';
import { TransferData } from '@/services/v2/api/0x';
import {
  OneInchBadRequestResponse,
  OneInchToken,
  QuoteParams,
  QuoteResponse,
  SwapParams,
  SwapResponse,
  TokensResponse
} from '@/services/v2/api/1inch/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import {
  getPureBaseAssetAddress,
  isBaseAsset,
  sameAddress
} from '@/utils/address';
import { getNetwork, Network } from '@/utils/networkTypes';

export class OneInchAPIService extends MultiChainAPIService {
  protected baseURL: string;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = '1inch.api.service';
  protected static supportedNetworks: Array<Network> = [
    Network.mainnet,
    Network.binance,
    Network.polygon,
    Network.optimism,
    Network.arbitrum,
    Network.avalanche,
    Network.fantom
  ];
  protected availableTokens: Map<string, OneInchToken> | undefined;
  protected useAvailableTokens: boolean;

  constructor(
    currentAddress: string,
    network: Network,
    useAvailableTokens = false
  ) {
    super(currentAddress, network);
    this.useAvailableTokens = useAvailableTokens;
    this.baseURL = this.lookupBaseURL(network);
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Accept: 'application/json'
      },
      paramsSerializer: this.getParamsSerializer,
      validateStatus: (status) => status === 200
    });
  }

  protected applyAxiosInterceptors(instance: AxiosInstance): AxiosInstance {
    axiosRetry(instance, {
      retries: 3,
      retryCondition: (error: AxiosError) =>
        (axiosRetry.isIdempotentRequestError(error) &&
          error.response?.status === ResponseHTTPErrorCode.TooManyRequests) ||
        error.response?.status === ResponseHTTPErrorCode.ServiceUnavailable,
      retryDelay: (retryCount, error) => {
        if (error.response?.headers['retry-after'] !== undefined) {
          const number = Number.parseInt(error.response.headers['retry-after']);
          if (Number.isNaN(number)) {
            return number * 1000;
          }

          return dayjs(error.response.headers['retry-after']).diff(
            dayjs(),
            'millisecond'
          );
        }

        return exponentialDelay(retryCount);
      }
    });

    instance.interceptors.response.use(undefined, this.formatError.bind(this));

    return instance;
  }

  protected async getAvailableTokens(): Promise<Map<string, OneInchToken>> {
    if (this.availableTokens !== undefined) {
      return this.availableTokens;
    }

    const res = await this.client.get<TokensResponse>('/tokens');
    const map = new Map<string, OneInchToken>();
    const networkChainId = getNetwork(this.network)?.chainId;
    for (const token of res.data.tokens) {
      let address = token.address;
      try {
        address = Web3.utils.toChecksumAddress(token.address, networkChainId);
      } catch (error) {
        addSentryBreadcrumb({
          type: 'debug',
          message: 'Unable to convert address to checksum variant',
          data: {
            address: token.address,
            error
          }
        });
      } finally {
        map.set(address, token);
      }
    }

    this.availableTokens = map;
    return this.availableTokens;
  }

  public async getTransferData(
    buyTokenAddress: string,
    sellTokenAddress: string,
    rawAmount: string,
    isInputAmount = true,
    slippage: string
  ): Promise<TransferData> {
    if (!isInputAmount) {
      throw new MoverError('Unable to use output amount as an argument');
    }

    const data = await this.getSwapData({
      toTokenAddress: buyTokenAddress,
      fromTokenAddress: sellTokenAddress,
      amount: rawAmount,
      slippage: slippage,
      fromAddress: this.currentAddress
    });

    return {
      buyAmount: data.toTokenAmount,
      data: data.tx.data,
      swappingVia: data.protocols[0].name ?? '',
      value: data.tx.value,
      sellAmount: data.fromTokenAmount,
      allowanceTarget: '',
      buyTokenToEthRate: '',
      sellTokenToEthRate: '',
      to: data.tx.to
    };
  }

  public async getQuoteData(params: QuoteParams): Promise<QuoteResponse> {
    if (!this.ensureNetworkIsSupported(this.network)) {
      throw new NetworkFeatureNotSupportedError('1inch.io Swaps', this.network);
    }

    const fromTokenAddress = this.substituteAssetAddressIfNeeded(
      params.fromTokenAddress
    );
    const fromTokenSupported = await this.ensureTokenSupported(
      fromTokenAddress
    );
    if (!fromTokenSupported) {
      throw new MoverError('Input token is not supported by OneInch', {
        address: params.fromTokenAddress
      });
    }

    const toTokenAddress = this.substituteAssetAddressIfNeeded(
      params.toTokenAddress
    );
    const toTokenSupported = await this.ensureTokenSupported(toTokenAddress);
    if (!toTokenSupported) {
      throw new MoverError('Output token is not supported by OneInch', {
        address: params.toTokenAddress
      });
    }

    return (
      await this.client.get<QuoteResponse>('/quote', {
        params: {
          ...params,
          fromTokenAddress: fromTokenAddress,
          toTokenAddress: toTokenAddress
        }
      })
    ).data;
  }

  public async getSwapData(params: SwapParams): Promise<SwapResponse> {
    if (!this.ensureNetworkIsSupported(this.network)) {
      throw new NetworkFeatureNotSupportedError('1inch.io Swaps', this.network);
    }

    const fromTokenAddress = this.substituteAssetAddressIfNeeded(
      params.fromTokenAddress
    );
    const fromTokenSupported = await this.ensureTokenSupported(
      fromTokenAddress
    );
    if (!fromTokenSupported) {
      throw new MoverError('Input token is not supported by OneInch', {
        address: params.fromTokenAddress
      });
    }

    const toTokenAddress = this.substituteAssetAddressIfNeeded(
      params.toTokenAddress
    );
    const toTokenSupported = await this.ensureTokenSupported(toTokenAddress);
    if (!toTokenSupported) {
      throw new MoverError('Output token is not supported by OneInch', {
        address: params.toTokenAddress
      });
    }

    return (
      await this.client.get<SwapResponse>('/swap', {
        params: {
          ...params,
          fromTokenAddress: fromTokenAddress,
          toTokenAddress: toTokenAddress
        }
      })
    ).data;
  }

  protected async ensureTokenSupported(tokenAddress: string): Promise<boolean> {
    if (!this.useAvailableTokens) {
      return true;
    }

    if (sameAddress(tokenAddress, getPureBaseAssetAddress())) {
      return true;
    }

    try {
      const availableTokensMap = await this.getAvailableTokens();
      return availableTokensMap.has(tokenAddress);
    } catch (error) {
      addSentryBreadcrumb({
        type: 'warn',
        category: this.sentryCategoryPrefix,
        message:
          'Failed to load available tokens. Consider token available for swap',
        data: {
          error
        }
      });

      return true;
    }
  }

  protected formatError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      addSentryBreadcrumb(this.formatAxiosErrorSentryBreadcrumb(error));

      if (error.response !== undefined) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data === undefined) {
          addSentryBreadcrumb({
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

        addSentryBreadcrumb({
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
        addSentryBreadcrumb({
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

    addSentryBreadcrumb({
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
    response: AxiosResponse<OneInchBadRequestResponse>
  ): never {
    addSentryBreadcrumb({
      type: 'error',
      category: this.sentryCategoryPrefix,
      message: `Request failed with code ${response.status} (${response.statusText}): ${response.data.error}`,
      data: {
        error: response.data.error,
        description: response.data.description,
        meta: response.data.meta
      }
    });

    if (response.data.statusCode === ResponseHTTPErrorCode.BadRequest) {
      throw new MoverError(response.data.description, response.data);
    }

    throw new MoverError(response.data.description, response.data);
  }

  protected ensureNetworkIsSupported(network?: Network): boolean {
    if (network === undefined) {
      return false;
    }

    return OneInchAPIService.supportedNetworks.includes(network);
  }

  protected lookupBaseURL(network: Network): string {
    const networkInfo = getNetwork(network);
    return `https://api.1inch.io/v4.0/${networkInfo?.chainId ?? 1}`;
  }

  protected substituteAssetAddressIfNeeded(address: string): string {
    return OneInchAPIService.substituteAssetAddressIfNeeded(
      address,
      this.network
    );
  }

  protected static substituteAssetAddressIfNeeded(
    address: string,
    network: Network
  ): string {
    if (isBaseAsset(address, network)) {
      return getPureBaseAssetAddress();
    }

    return address;
  }
}
