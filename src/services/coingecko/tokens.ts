import axios from 'axios';
import { Result } from '../responses';

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

type CoingeckoEthPriceResponse = {
  ethereum: {
    usd: number;
  };
};

const URL = 'https://tokens.coingecko.com/uniswap/all.json';

export const GetAllTokens = async (): Promise<
  Result<Array<CoingeckoToken>, string>
> => {
  try {
    const response = (await axios.get<CoingeckoAllTokensResponse>(URL)).data;

    return { isError: false, result: response.tokens };
  } catch (err) {
    return { isError: true, error: err };
  }
};

export const getEthPrice = async (): Promise<Result<string, string>> => {
  const url =
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
  try {
    const response = (await axios.get<CoingeckoEthPriceResponse>(url)).data;
    console.log(response);
    return { isError: false, result: String(response.ethereum.usd ?? '0') };
  } catch (err) {
    return { isError: true, error: err };
  }
};
