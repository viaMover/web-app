import { sameAddress } from './../../utils/address';
import { multiply } from './../../utils/bigmath';
import { SUSHISWAP_PRICES_QUERY } from './queries';
import { sushiswapClient } from './client';

type SushiSwapPriceResponse = {
  bundle: {
    id: string;
    ethPrice: string;
  };
  tokens: Array<SushiSwapToken>;
};

type SushiSwapToken = {
  decimals: string;
  derivedETH: string;
  id: string;
  name: string;
  symbol: string;
};

export const GetTokenPrice = async (address: string): Promise<string> => {
  const prices = await GetTokensPrice([address]);
  return prices.get(address) ?? '0';
};

export const GetTokensPrice = async (
  addresses: Array<string>
): Promise<Map<string, string>> => {
  const result = new Map<string, string>();

  const res = await sushiswapClient.query<SushiSwapPriceResponse>({
    query: SUSHISWAP_PRICES_QUERY,
    variables: {
      addresses: addresses.map((addr) => addr.toLowerCase()),
      fetchPolicy: 'network-only'
    }
  });
  const ethPriceUSD = res.data.bundle.ethPrice;

  if (!ethPriceUSD) {
    throw new Error('empty eth price');
  }

  addresses.forEach((addr) => {
    let priceUSD = '0';
    const derivedEth = res.data.tokens.find((t) =>
      sameAddress(t.id, addr)
    )?.derivedETH;

    if (derivedEth) {
      priceUSD = multiply(derivedEth, ethPriceUSD);
    }
    result.set(addr, priceUSD);
  });

  return result;
};
