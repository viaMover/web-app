export enum Network {
  binance = 'binance',
  binanceTest = 'binanceTest',
  kovan = 'kovan',
  mainnet = 'mainnet',
  matic = 'matic',
  ropsten = 'ropsten'
}

export type NetworkInfo = {
  network: Network;
  chainId: number;
  explorer: string;
};

export const networks = new Array<NetworkInfo>(
  {
    chainId: 1,
    network: Network.mainnet,
    explorer: 'https://etherscan.io'
  },
  {
    chainId: 3,
    network: Network.ropsten,
    explorer: 'https://ropsten.etherscan.io'
  },
  {
    chainId: 42,
    network: Network.kovan,
    explorer: 'https://kovan.etherscan.io'
  },
  {
    chainId: 137,
    network: Network.matic,
    explorer: 'explorer-mainnet.maticvigil.com'
  },
  {
    chainId: 56,
    network: Network.binance,
    explorer: 'https://bscscan.com'
  },
  {
    chainId: 97,
    network: Network.binanceTest,
    explorer: 'https://testnet.bscscan.com'
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
