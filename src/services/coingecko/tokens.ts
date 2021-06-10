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
