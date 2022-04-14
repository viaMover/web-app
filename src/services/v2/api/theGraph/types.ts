import gql from 'graphql-tag';

export type SushiSwapPriceResponse = {
  bundle: {
    id: string;
    ethPrice: string;
  };
  tokens: Array<SushiSwapToken>;
};

export type SushiSwapToken = {
  decimals: string;
  derivedETH: string;
  id: string;
  name: string;
  symbol: string;
};

export const SUSHISWAP_PRICES_QUERY = gql`
  query tokens($addresses: [String]!) {
    tokens(where: { id_in: $addresses, derivedETH_gt: 0, liquidity_gt: 0 }) {
      id
      derivedETH
      symbol
      name
      decimals
    }
    bundle(id: 1) {
      id
      ethPrice
    }
  }
`;

export type PriceRecord = {
  [address: string]: {
    [currency: string]: string;
  };
};
