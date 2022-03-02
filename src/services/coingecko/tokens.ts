import axios from 'axios';

import { Network } from '@/utils/networkTypes';

import { Result } from '../responses';

export enum NetworkAlias {
  Eth = 'eth',
  Ropsten = 'ropsten',
  Rinkeby = 'rinkeby',
  Goerli = 'goerli',
  Koven = 'kovan',
  Polygon = 'polygon',
  Mumbai = 'mumbai',
  Bsc = 'bsc',
  BscTestnet = 'bsc testnet',
  Avalanche = 'avalanche',
  Fantom = 'fantom'
}

export enum TokenAlias {
  Ethereum = 'ethereum',
  Avalanche = 'avalanche-2',
  Fantom = 'fantom'
}

export type CoingeckoToken = {
  name: string;
  logoURI: string;
  chainId: string;
  address: string;
  symbol: string;
  decimals: number;
  isFavorite: boolean;
  isVerified: boolean;
};

type CoingeckoAllTokensResponse = {
  tokens: Array<CoingeckoToken>;
};

const URL = 'https://tokens.coingecko.com/uniswap/all.json';

export const getBaseTokenAlias = (network: Network): TokenAlias => {
  switch (network) {
    case Network.avalanche:
      return TokenAlias.Avalanche;
    case Network.fantom:
      return TokenAlias.Fantom;
    default:
      return TokenAlias.Ethereum;
  }
};

export const GetAllTokens = async (): Promise<
  Result<Array<CoingeckoToken>, string>
> => {
  try {
    const response = (await axios.get<CoingeckoAllTokensResponse>(URL)).data;

    return { isError: false, result: response.tokens };
  } catch (error) {
    return {
      isError: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const getNetworkBaseTokenPrice = async (
  network: Network
): Promise<Result<string, string>> => {
  const resp = await getPrice(getBaseTokenAlias(network), 'usd');
  if (resp.isError) {
    return resp;
  }

  return {
    isError: false,
    result: String(resp.result?.['ethereum']?.['usd'] ?? '0')
  };
};

export const getUsdcPriceInEur = async (): Promise<Result<string, string>> => {
  const resp = await getPrice('usd-coin', 'eur');
  if (resp.isError) {
    return resp;
  }

  return {
    isError: false,
    result: String(resp.result?.['usd-coin']?.['eur'] ?? '0')
  };
};

export const getPriceByAddress = async (
  platformId: string,
  addresses: Array<string>,
  currencies: Array<string>,
  opts?: GetSimplePriceOptions
): Promise<Result<SimpleTokenPriceRecord, string>> => {
  try {
    const res = await axios.get<SimpleTokenPriceRecord>(
      `https://api.coingecko.com/api/v3/simple/token_price/${platformId}`,
      {
        params: {
          ...opts,
          contract_addresses: addresses.join(','),
          vs_currencies: currencies.join(',')
        },
        transformResponse: (
          data: string | Record<string, unknown> | Array<unknown>
        ): Record<string, unknown> | Array<unknown> => {
          if (typeof data === 'string') {
            return JSON.parse(data);
          }

          return data;
        },
        validateStatus: (status): boolean => {
          return status === 200;
        }
      }
    );

    return { isError: false, result: res.data };
  } catch (error) {
    return {
      isError: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const getPrice = async (
  ids: string | Array<string>,
  currencies: string | Array<string>,
  opts?: GetSimplePriceOptions
): Promise<Result<SimplePriceRecord, string>> => {
  try {
    const res = await axios.get<SimplePriceRecord>(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ...opts,
          ids: Array.isArray(ids) ? ids.join(',') : ids,
          vs_currencies: Array.isArray(currencies)
            ? currencies.join(',')
            : currencies
        },
        transformResponse: (
          data: string | Record<string, unknown> | Array<unknown>
        ): Record<string, unknown> | Array<unknown> => {
          if (typeof data === 'string') {
            return JSON.parse(data);
          }

          return data;
        },
        validateStatus: (status): boolean => {
          return status === 200;
        }
      }
    );

    return { isError: false, result: res.data };
  } catch (error) {
    return {
      isError: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

type SimpleTokenPriceRecord = {
  [address: string]: {
    [currency: string]: number;
  };
};

type SimplePriceRecord = {
  [id: string]: {
    [currency: string]: number;
  };
};
type GetSimplePriceOptions = {
  include_market_cap?: boolean;
  include_24hr_vol?: boolean;
  include_24hr_change?: boolean;
  include_last_updated_at?: boolean;
};
