import * as Sentry from '@sentry/vue';
import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { MoverError, ResponseHTTPErrorCode } from '@/services/v2';
import { APIService } from '@/services/v2/api';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { getNetwork, Network } from '@/utils/networkTypes';
import { TokenWithBalance } from '@/wallet/types';

import {
  AnkrNetwork,
  GetAccountBalanceResult,
  isError,
  Request,
  Response
} from './types';

/**
 * A wrapper class for interacting with ANKR API (www.ankr.com)
 * @see https://documenter.getpostman.com/view/19024547/UVsEVUGQ#74b5cc68-fba2-415c-a53b-28c08818f970
 */
export class AnkrAPIService extends APIService {
  protected baseURL: string;
  protected apiKey: string;
  protected networks: Array<AnkrNetwork> = [];
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'ankr.api.service';
  protected static readonly validNetworks: Array<Network> = [
    Network.mainnet,
    Network.binance,
    Network.polygon,
    Network.avalanche,
    Network.fantom,
    Network.arbitrum
  ];

  constructor(
    currentAddress: string,
    apiKey: string,
    networks: Array<Network>
  ) {
    super(currentAddress);
    this.baseURL = this.lookupBaseURL();
    this.apiKey = apiKey;
    this.networks = networks.map((m) => {
      const ankrNetwork = this.lookupNetworkId(m);
      if (ankrNetwork === undefined) {
        throw new MoverError(
          `Network '${m}' is not supported by ${this.sentryCategoryPrefix}`
        );
      }
      return ankrNetwork;
    });
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
   * Requests tokens by address (multichain)
   */
  public getTokens = async (): Promise<Array<TokenWithBalance>> => {
    const res = (
      await this.client.post<Response<GetAccountBalanceResult>>('', {
        jsonrpc: '2.0',
        id: 1,
        method: 'ankr_getAccountBalance',
        params: {
          blockchain: this.networks,
          walletAddress: this.currentAddress
        }
      } as Request)
    ).data;

    if (isError(res)) {
      addSentryBreadcrumb({
        type: 'error',
        message: 'API responded with JSON RPC error',
        category: this.sentryCategoryPrefix,
        data: {
          code: res.error.code,
          message: res.error.message
        }
      });
      throw new MoverError('get tokens request error');
    }

    return res.result.assets
      .map((t) => {
        let address = t.contractAddress;
        let logo = t.thumbnail;
        if (t.tokenType === 'NATIVE') {
          const net = getNetwork(
            this.lookupNetworkById(t.blockchain) ?? Network.mainnet
          );
          address = net?.baseAsset.address ?? '';
          logo = net?.baseAsset.iconURL ?? '';
        }
        return {
          address: address,
          decimals: t.tokenDecimals,
          symbol: t.tokenSymbol,
          name: t.tokenName,
          logo: logo,
          priceUSD: t.tokenPrice,
          marketCap: 0,
          balance: t.balance
        };
      })
      .map((t) => {
        return t;
      });
  };

  protected formatError = (error: unknown): never => {
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
  };

  private formatAxiosErrorSentryBreadcrumb = (
    axiosError: AxiosError<unknown>
  ): Sentry.Breadcrumb => {
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
  };

  protected applyAxiosInterceptors = (
    instance: AxiosInstance
  ): AxiosInstance => {
    axiosRetry(instance, {
      retries: 3,
      retryCondition: (error: AxiosError) =>
        axiosRetry.isIdempotentRequestError(error) &&
        error.response?.status === ResponseHTTPErrorCode.TooManyRequests
    });

    instance.interceptors.response.use(undefined, this.formatError.bind(this));

    return instance;
  };

  protected static ensureNetworkIsSupported = (network?: Network): boolean => {
    if (network === undefined) {
      return false;
    }

    return AnkrAPIService.validNetworks.includes(network);
  };

  public lookupNetworkId = (network: Network): AnkrNetwork | undefined => {
    switch (network) {
      case Network.mainnet:
        return 'eth';
      case Network.avalanche:
        return 'avalanche';
      case Network.fantom:
        return 'fantom';
      case Network.polygon:
        return 'polygon';
      case Network.arbitrum:
        return 'arbitrum';
      case Network.binance:
        return 'bsc';
      default:
        return undefined;
    }
  };

  public lookupNetworkById = (
    ankrNetwork: AnkrNetwork
  ): Network | undefined => {
    switch (ankrNetwork) {
      case 'eth':
        return Network.mainnet;
      case 'avalanche':
        return Network.avalanche;
      case 'fantom':
        return Network.fantom;
      case 'polygon':
        return Network.polygon;
      case 'arbitrum':
        return Network.arbitrum;
      case 'bsc':
        return Network.binance;
      default:
        return undefined;
    }
  };

  public lookupBaseURL = (): string => {
    return 'https://rpc.ankr.com/multichain';
  };

  public static canHandle(network: Network): boolean {
    return this.validNetworks.includes(network);
  }
}
