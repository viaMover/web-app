export enum Network {
  binance = 'binance',
  binanceTest = 'binanceTest',
  kovan = 'kovan',
  rinkeby = 'rinkeby',
  mainnet = 'mainnet',
  matic = 'matic',
  ropsten = 'ropsten',
  avalanche = 'avalanche',
  arbitrum = 'arbitrum',
  fantom = 'fantom'
}

export type NetworkInfo = {
  network: Network;
  chainId: number;
  explorer: string;
  subsidizedUrl?: string;
};

export const networks = new Array<NetworkInfo>(
  {
    chainId: 1,
    network: Network.mainnet,
    explorer: 'https://etherscan.io',
    subsidizedUrl: 'https://api.viamover.com/api/v1'
  },
  {
    chainId: 3,
    network: Network.ropsten,
    explorer: 'https://ropsten.etherscan.io',
    subsidizedUrl: undefined
  },
  {
    chainId: 4,
    network: Network.rinkeby,
    explorer: 'https://rinkeby.etherscan.io',
    subsidizedUrl: undefined
  },
  {
    chainId: 42,
    network: Network.kovan,
    explorer: 'https://kovan.etherscan.io',
    subsidizedUrl: undefined
  },
  {
    chainId: 137,
    network: Network.matic,
    explorer: 'explorer-mainnet.maticvigil.com',
    subsidizedUrl: undefined
  },
  {
    chainId: 56,
    network: Network.binance,
    explorer: 'https://bscscan.com',
    subsidizedUrl: undefined
  },
  {
    chainId: 97,
    network: Network.binanceTest,
    explorer: 'https://testnet.bscscan.com',
    subsidizedUrl: undefined
  },
  {
    chainId: 43114,
    network: Network.avalanche,
    explorer: 'https://snowtrace.io/',
    subsidizedUrl: undefined
  },
  {
    chainId: 42161,
    network: Network.arbitrum,
    explorer: 'https://arbiscan.io/',
    subsidizedUrl: undefined
  },
  {
    chainId: 250,
    network: Network.fantom,
    explorer: 'https://ftmscan.com',
    subsidizedUrl: undefined
  }
);

export const getNetworkByChainId = (
  chainId: number
): NetworkInfo | undefined => {
  return networks.find((n) => n.chainId === chainId);
};

export const getNetwork = (network: Network): NetworkInfo | undefined => {
  return networks.find((n) => n.network === network);
};
