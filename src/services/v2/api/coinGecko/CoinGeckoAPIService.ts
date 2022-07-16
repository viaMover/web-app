import * as Sentry from '@sentry/vue';
import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import Web3 from 'web3';

import { MoverError, NetworkFeatureNotSupportedError } from '@/services/v2';
import { MultiChainAPIService } from '@/services/v2/api';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { chunkArray, toArray } from '@/utils/arrays';
import { getNetwork, Network } from '@/utils/networkTypes';
import { getBaseAssetData } from '@/wallet/references/data';

import {
  APIPriceRecord,
  BaseAssetPriceRecord,
  CachedPrice,
  Currency,
  GetPriceOptions,
  PriceRecord
} from './types';

export class CoinGeckoAPIService extends MultiChainAPIService {
  protected readonly baseURL: string;
  protected readonly platformId: string | undefined;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'coinGecko.api.service';
  protected static readonly MaxChunkSize = 100;
  private readonly pricesCache: Map<string, CachedPrice>;

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();
    this.platformId = this.lookupPlatformId(network);
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Accept: 'application/json'
      },
      paramsSerializer: this.getParamsSerializer,
      validateStatus: (status) => status === 200
    });

    axiosRetry(this.client, {
      retries: 3,
      retryCondition: (error: AxiosError) =>
        axiosRetry.isIdempotentRequestError(error) &&
        (error.response?.status === 429 ||
          (typeof error.response?.data === 'string' &&
            error.response.data.startsWith('Throttled')))
    });

    this.pricesCache = new Map<string, CachedPrice>();
  }

  public async getPricesByContractAddress(
    contractAddresses: Array<string> | string,
    currency: Currency,
    opts?: GetPriceOptions
  ): Promise<PriceRecord> {
    if (this.platformId === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'CoinGecko price by contract address',
        this.network
      );
    }

    // prevent from sending chunks too large to handle (recursive call)
    const addresses = toArray(contractAddresses);
    if (addresses.length > CoinGeckoAPIService.MaxChunkSize) {
      const chunks = chunkArray(addresses, CoinGeckoAPIService.MaxChunkSize);
      const promises = new Array<Promise<PriceRecord>>();
      for (const chunk of chunks) {
        promises.push(this.getPricesByContractAddress(chunk, currency, opts));
      }

      const results = await Promise.all(promises);
      let aggregateObject: PriceRecord = {};
      for (const result of results) {
        aggregateObject = Object.assign(aggregateObject, result);
      }

      return aggregateObject;
    }

    let result: PriceRecord = {};

    for (let i = addresses.length - 1; i >= 0; i--) {
      const address = addresses[i];
      const cachedPrice = this.pricesCache.get(address);
      if (
        cachedPrice != undefined &&
        cachedPrice.expirationTimestampMs > Date.now()
      ) {
        console.log(`Get price for token address ${addresses[i]}`);
        addresses.splice(i, 1);
        result[address] = cachedPrice.value;
      }
    }

    // check if base asset address is present in the requested addresses
    const baseAssetAddress = getBaseAssetData(this.network).address;
    const baseAssetAddressIdx = addresses.findIndex((address) =>
      sameAddress(address, baseAssetAddress)
    );
    let shouldGetBaseAssetPrice = false;
    if (baseAssetAddressIdx > -1) {
      shouldGetBaseAssetPrice = true;
      addresses.splice(baseAssetAddressIdx, 1);
    }

    // if still has addresses besides the base asset then perform a request
    if (addresses.length > 0) {
      const data = (
        await this.client.get<APIPriceRecord>(
          `/simple/token_price/${this.platformId}`,
          {
            params: {
              ...opts,
              contract_addresses: addresses,
              vs_currencies: currency
            }
          }
        )
      ).data;

      result = this.mapAPIPriceRecord(data, addresses);
    }

    // append base asset price to the result manually if needed
    if (shouldGetBaseAssetPrice) {
      result[baseAssetAddress] = await this.getBaseAssetPrice(currency, opts);
    }

    return result;
  }

  public async getPricesById(
    ids: Array<string> | string,
    currency: Currency,
    opts?: GetPriceOptions
  ): Promise<PriceRecord> {
    const data = (
      await this.client.get<APIPriceRecord>('/simple/price', {
        params: {
          ...opts,
          ids,
          vs_currencies: currency
        }
      })
    ).data;

    return this.mapAPIPriceRecord(data);
  }

  public async getBaseAssetPrice(
    currency: Currency,
    opts?: GetPriceOptions
  ): Promise<BaseAssetPriceRecord> {
    const baseAssetId = this.lookupBaseAssetId(this.network);
    if (baseAssetId === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'CoinGecko base asset price',
        this.network
      );
    }

    const data = await this.getPricesById(baseAssetId, currency, opts);
    if (data[baseAssetId] === undefined) {
      throw new MoverError(
        'Failed to get CoinGecko base asset price: response is empty',
        { baseAssetId, data }
      );
    }

    return data[baseAssetId];
  }

  public lookupBaseAssetId(network: Network): string | undefined {
    switch (network) {
      case Network.mainnet:
        return 'ethereum';
      case Network.avalanche:
        return 'avalanche-2';
      case Network.fantom:
        return 'fantom';
      case Network.polygon:
        return 'matic-network';
      case Network.binance:
        return 'binancecoin';
      default:
        return undefined;
    }
  }

  protected mapAPIPriceRecord(
    data: APIPriceRecord,
    addresses?: Array<string>
  ): PriceRecord {
    const result: PriceRecord = {};
    const chainId = getNetwork(this.network)?.chainId;
    for (const assetAddress in data) {
      let recoveredKey = addresses?.find((address) =>
        sameAddress(assetAddress, address)
      );
      if (recoveredKey === undefined) {
        try {
          recoveredKey = Web3.utils.toChecksumAddress(assetAddress, chainId);
        } catch (error) {
          recoveredKey = assetAddress;
        }
      }
      result[recoveredKey] = {};
      for (const currency in data[assetAddress]) {
        result[recoveredKey][currency] =
          data[assetAddress][currency].toString(10);
      }

      this.pricesCache.set(recoveredKey, {
        value: result[recoveredKey],
        expirationTimestampMs: 5 * 60 * 1000
      });
    }

    return result;
  }

  protected lookupPlatformId(network?: Network): string | undefined {
    switch (network) {
      case Network.binance:
        return 'binance-smart-chain';
      case Network.mainnet:
        return 'ethereum';
      case Network.fantom:
        return 'fantom';
      case Network.polygon:
        return 'polygon-pos';
      case Network.avalanche:
        return 'avalanche';
      case Network.arbitrum:
        return 'arbitrum-one';
      case Network.optimism:
        return 'optimistic-ethereum';
      case Network.celo:
        return 'celo';
      default:
        return undefined;
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

  public lookupBaseURL(): string {
    return 'https://api.coingecko.com/api/v3';
  }
}
