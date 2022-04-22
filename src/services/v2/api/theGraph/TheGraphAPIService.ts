import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';

import { sushiswapClient } from '@/services/thegraph/client';
import { SUSHISWAP_PRICES_QUERY } from '@/services/thegraph/queries';
import { MoverError, NetworkFeatureNotSupportedError } from '@/services/v2';
import { MultiChainAPIService } from '@/services/v2/api';
import { CurrencyNotSupportedError } from '@/services/v2/api/theGraph/CurrencyNotSupportedError';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { NativeCurrency } from '@/store/modules/account/types';
import { sameAddress } from '@/utils/address';
import { chunkArray, toArray } from '@/utils/arrays';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { getBaseAssetData } from '@/wallet/references/data';

import { PriceRecord, SushiSwapPriceResponse } from './types';

export class TheGraphAPIService extends MultiChainAPIService {
  protected baseURL: string;
  protected readonly client: ApolloClient<NormalizedCacheObject>;
  protected readonly sentryCategoryPrefix = 'theGraph.api.service';
  protected static readonly MaxChunkSize = 150;

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();

    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: this.baseURL
      })
    });
  }

  public async getPricesByContractAddress(
    contractAddresses: Array<string> | string,
    currencies: Array<string> | string
  ): Promise<PriceRecord> {
    if (this.network !== Network.mainnet) {
      throw new NetworkFeatureNotSupportedError(
        'TheGraph prices',
        this.network
      );
    }

    if (
      !toArray(currencies).some((currency) => currency === NativeCurrency.USD)
    ) {
      throw new CurrencyNotSupportedError(
        'Requested currencies are not supported by TheGraph',
        currencies
      );
    }

    // prevent from sending chunks too large to handle (recursive call)
    const addresses = toArray(contractAddresses);
    if (addresses.length > TheGraphAPIService.MaxChunkSize) {
      const chunks = chunkArray(addresses, TheGraphAPIService.MaxChunkSize);
      const promises = new Array<Promise<PriceRecord>>();
      for (const chunk of chunks) {
        promises.push(this.getPricesByContractAddress(chunk, currencies));
      }

      const results = await Promise.all(promises);
      let aggregateObject: PriceRecord = {};
      for (const result of results) {
        aggregateObject = Object.assign(aggregateObject, result);
      }

      return aggregateObject;
    }

    try {
      const result: PriceRecord = {};

      const res = await sushiswapClient.query<SushiSwapPriceResponse>({
        query: SUSHISWAP_PRICES_QUERY,
        variables: {
          addresses: addresses.map((address) => address.toLowerCase()),
          fetchPolicy: 'network-only'
        }
      });
      if (res.errors !== undefined) {
        throw new MoverError('Failed to execute query', { errors: res.errors });
      }
      const ethPriceUSD = res.data.bundle.ethPrice;

      if (!ethPriceUSD) {
        throw new MoverError(
          'Failed to load prices from TheGraph: Empty ETH price received',
          res.data
        );
      }

      for (const address of addresses) {
        const derivedETH = res.data.tokens.find((t) =>
          sameAddress(t.id, address)
        )?.derivedETH;
        if (derivedETH === undefined) {
          continue;
        }

        result[address] = {
          [NativeCurrency.USD]: multiply(derivedETH, ethPriceUSD)
        };
      }

      result[getBaseAssetData(this.network).address] = {
        [NativeCurrency.USD]: res.data.bundle.ethPrice
      };

      return result;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  protected formatError(error: unknown): never {
    addSentryBreadcrumb({
      type: 'error',
      category: this.sentryCategoryPrefix,
      message: 'Failed to execute query',
      data: {
        error
      }
    });

    throw error;
  }

  protected lookupBaseURL(): string {
    return 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange';
  }
}
