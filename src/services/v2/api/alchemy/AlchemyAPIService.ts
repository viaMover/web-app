import * as Sentry from '@sentry/vue';
import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { MoverError, ResponseHTTPErrorCode } from '@/services/v2';
import { APIService } from '@/services/v2/api';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { fromWei, greaterThan } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { getAllTokens } from '@/wallet/allTokens';
import { Token, TokenWithBalance } from '@/wallet/types';

import { GetTokenBalancesResult, isError, Request, Response } from './types';

/**
 * A wrapper class for interacting with Alchemy API (docs.alchemy.com)
 * @see https://docs.alchemy.com/alchemy/enhanced-apis/token-api/how-to-get-token-balance-for-an-address
 */
export class AlchemyAPIService extends APIService {
  protected baseURL = '';
  protected apiKey: string;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'alchemy.api.service';
  protected static readonly validNetworks: Array<Network> = [Network.optimism];
  protected tokensData: Record<Network, Array<Token>>;

  constructor(currentAddress: string, apiKey: string) {
    super(currentAddress);
    this.apiKey = apiKey;
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
    this.tokensData = {} as Record<Network, Array<Token>>;
    AlchemyAPIService.validNetworks.forEach((n) => {
      this.tokensData[n] = getAllTokens(n);
    });
  }

  /**
   * Requests tokens by address (multichain)
   */
  public getTokens = async (
    network: Network
  ): Promise<Array<TokenWithBalance>> => {
    const endpoint = this.lookupEndpointByNetwork(network);
    if (endpoint === undefined) {
      addSentryBreadcrumb({
        type: 'error',
        message: `Cant find endpoint for this network: ${network}`,
        category: this.sentryCategoryPrefix
      });
      throw new MoverError('get tokens error');
    }
    const res = (
      await this.client.post<Response<GetTokenBalancesResult>>(
        `${endpoint}/${this.apiKey}`,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenBalances',
          params: [
            this.currentAddress,
            this.tokensData[network].map((t) => t.address)
          ]
        } as Request
      )
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

    const result: Array<TokenWithBalance> = [];
    for (const t of res.result.tokenBalances) {
      const address = t.contractAddress;
      const token = this.tokensData[network].find((t) =>
        sameAddress(t.address, address)
      );
      if (
        token !== undefined &&
        t.tokenBalance !== null &&
        greaterThan(t.tokenBalance, 0)
      ) {
        result.push({
          ...token,
          priceUSD: '',
          balance: fromWei(String(parseInt(t.tokenBalance, 16)), token.decimals)
        });
      }
    }

    return result;
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

  public lookupEndpointByNetwork = (network: Network): string | undefined => {
    switch (network) {
      case Network.optimism:
        return 'https://opt-mainnet.g.alchemy.com/v2';
      default:
        return undefined;
    }
  };

  public static canHandle(network: Network): boolean {
    return this.validNetworks.includes(network);
  }
}
