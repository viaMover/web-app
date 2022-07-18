import { MoverError } from '@/services/v2';
import { CoinGeckoAPIService } from '@/services/v2/api/coinGecko';
import { TheGraphAPIService } from '@/services/v2/api/theGraph';
import { getAssetPriceFromPriceRecord } from '@/services/v2/utils/price';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { NativeCurrency } from '@/store/modules/account/types';
import { Network } from '@/utils/networkTypes';

import { CachedPrice } from './types';

export class TokenPriceService {
  protected readonly coinGeckoAPIService: CoinGeckoAPIService;
  protected readonly theGraphAPIService: TheGraphAPIService;
  protected readonly sentryCategoryPrefix = 'tokenPrice.api.service';
  private readonly pricesCache: Map<string, CachedPrice>;

  constructor(currentAddress: string, network: Network) {
    this.coinGeckoAPIService = new CoinGeckoAPIService(currentAddress, network);
    this.theGraphAPIService = new TheGraphAPIService(currentAddress, network);
    this.pricesCache = new Map<string, CachedPrice>();
  }

  public async getPriceByContractAddress(
    contractAddress: string,
    currency: NativeCurrency
  ): Promise<string> {
    addSentryBreadcrumb({
      type: 'info',
      message: 'Trying to get price by contract address',
      category: this.sentryCategoryPrefix,
      data: {
        contractAddress,
        currency
      }
    });

    const cachedPrice = this.pricesCache.get(
      this.cacheKey(contractAddress, currency)
    );
    if (
      cachedPrice != undefined &&
      cachedPrice.expirationTimestampMs > Date.now()
    ) {
      console.log(
        `Get price for token address ${contractAddress}: `,
        cachedPrice.value
      );
      addSentryBreadcrumb({
        type: 'info',
        message: 'Cached price found',
        category: this.sentryCategoryPrefix,
        data: {
          contractAddress,
          cachedPrice
        }
      });

      const price = cachedPrice.value?.[currency];

      if (price !== undefined) {
        this.pricesCache.set(this.cacheKey(contractAddress, currency), {
          value: { [currency]: price },
          expirationTimestampMs: Date.now() + 5 * 60 * 1000
        });
        return price;
      }

      addSentryBreadcrumb({
        type: 'info',
        message: 'Cached price with wrong currency, do regular request',
        category: this.sentryCategoryPrefix,
        data: {
          contractAddress,
          cachedPrice
        }
      });
    }

    try {
      const priceRecord =
        await this.coinGeckoAPIService.getPricesByContractAddress(
          contractAddress,
          currency
        );

      const price = getAssetPriceFromPriceRecord(
        priceRecord,
        contractAddress,
        currency
      );

      if (price !== undefined) {
        this.pricesCache.set(this.cacheKey(contractAddress, currency), {
          value: { [currency]: price },
          expirationTimestampMs: Date.now() + 5 * 60 * 1000
        });
        return price;
      }
      throw new MoverError('Can not get price from coingecko response', {
        data: {
          priceRecord,
          contractAddress,
          currency
        }
      });
    } catch (e) {
      addSentryBreadcrumb({
        type: 'info',
        message: 'Can not get token price from coingecko, trying TheGraph...',
        category: this.sentryCategoryPrefix,
        data: {
          error: e,
          contractAddress,
          currency
        }
      });

      const theGraphPriceRecord =
        await this.theGraphAPIService.getPricesByContractAddress(
          contractAddress,
          currency
        );

      const price = getAssetPriceFromPriceRecord(
        theGraphPriceRecord,
        contractAddress,
        currency
      );

      if (price !== undefined) {
        this.pricesCache.set(this.cacheKey(contractAddress, currency), {
          value: { [currency]: price },
          expirationTimestampMs: Date.now() + 5 * 60 * 1000
        });
        return price;
      }
      throw new MoverError('Can not get price from the graph response', {
        data: {
          theGraphPriceRecord,
          contractAddress,
          currency
        }
      });
    }
  }

  private cacheKey(contractAddress: string, currency: NativeCurrency): string {
    return `${contractAddress}_${currency}`;
  }
}
