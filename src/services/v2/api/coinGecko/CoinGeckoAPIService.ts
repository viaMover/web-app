import * as Sentry from '@sentry/vue';
import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import Web3 from 'web3';

import { MoverError, NetworkFeatureNotSupportedError } from '@/services/v2';
import { APIService } from '@/services/v2/api';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { chunkArray, toArray } from '@/utils/arrays';
import { getNetwork, Network } from '@/utils/networkTypes';
import { getBaseAssetData } from '@/wallet/references/data';

import {
  APIPriceRecord,
  BaseAssetPriceRecord,
  Currency,
  GetPriceOptions,
  PriceRecord
} from './types';

export class CoinGeckoAPIService extends APIService {
  protected readonly baseURL = 'https://api.coingecko.com/api/v3';
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'coinGecko.api.service';
  protected static readonly MaxChunkSize = 100;

  constructor(currentAddress: string) {
    super(currentAddress);
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
  }

  public async getPricesByContractAddress(
    contractAddresses: Array<string> | string,
    currencies: Array<Currency> | Currency,
    network: Network,
    opts?: GetPriceOptions
  ): Promise<PriceRecord> {
    const platformId = this.lookupPlatformId(network);
    if (platformId === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'CoinGecko price by contract address',
        network
      );
    }

    // prevent from sending chunks too large to handle (recursive call)
    const addresses = toArray(contractAddresses);
    if (addresses.length > CoinGeckoAPIService.MaxChunkSize) {
      const chunks = chunkArray(addresses, CoinGeckoAPIService.MaxChunkSize);
      const promises = new Array<Promise<PriceRecord>>();
      for (const chunk of chunks) {
        promises.push(
          this.getPricesByContractAddress(chunk, currencies, network, opts)
        );
      }

      const results = await Promise.all(promises);
      let aggregateObject: PriceRecord = {};
      for (const result of results) {
        aggregateObject = Object.assign(aggregateObject, result);
      }

      return aggregateObject;
    }

    // check if base asset address is present in the requested addresses
    const baseAssetAddress = getBaseAssetData(network).address;
    const baseAssetAddressIdx = addresses.findIndex((address) =>
      sameAddress(address, baseAssetAddress)
    );
    let shouldGetBaseAssetPrice = false;
    if (baseAssetAddressIdx > -1) {
      shouldGetBaseAssetPrice = true;
      addresses.splice(baseAssetAddressIdx, 1);
    }

    let result: PriceRecord = {};
    // if still has addresses besides the base asset then perform a request
    if (addresses.length > 0) {
      const data = (
        await this.client.get<APIPriceRecord>(
          `/simple/token_price/${platformId}`,
          {
            params: {
              ...opts,
              contract_addresses: addresses,
              vs_currencies: currencies
            }
          }
        )
      ).data;

      result = this.mapAPIPriceRecord(data, network, addresses);
    }

    // append base asset price to the result manually if needed
    if (shouldGetBaseAssetPrice) {
      result[baseAssetAddress] = await this.getBaseAssetPrice(
        currencies,
        network,
        opts
      );
    }

    return result;
  }

  public async getPricesById(
    ids: Array<string> | string,
    currencies: Array<Currency> | Currency,
    network: Network,
    opts?: GetPriceOptions
  ): Promise<PriceRecord> {
    const data = (
      await this.client.get<APIPriceRecord>('/simple/price', {
        params: {
          ...opts,
          ids,
          vs_currencies: currencies
        }
      })
    ).data;

    return this.mapAPIPriceRecord(data, network);
  }

  public async getBaseAssetPrice(
    currencies: Array<Currency> | Currency,
    network: Network,
    opts?: GetPriceOptions
  ): Promise<BaseAssetPriceRecord> {
    const baseAssetId = this.lookupBaseAssetId(network);
    if (baseAssetId === undefined) {
      throw new NetworkFeatureNotSupportedError(
        'CoinGecko base asset price',
        network
      );
    }

    const data = await this.getPricesById(
      baseAssetId,
      currencies,
      network,
      opts
    );
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
      default:
        return undefined;
    }
  }

  protected mapAPIPriceRecord(
    data: APIPriceRecord,
    network: Network,
    addresses?: Array<string>
  ): PriceRecord {
    const result: PriceRecord = {};
    const chainId = getNetwork(network)?.chainId;
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
