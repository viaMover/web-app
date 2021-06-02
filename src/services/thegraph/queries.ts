import gql from 'graphql-tag';

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
