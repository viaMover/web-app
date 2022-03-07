import { APIKeys } from '@/settings/keys';
import { SmallTokenInfoWithIcon } from '@/wallet/types';

export enum Network {
  binance = 'binance',
  binanceTest = 'binanceTest',
  kovan = 'kovan',
  rinkeby = 'rinkeby',
  mainnet = 'mainnet',
  polygon = 'polygon',
  ropsten = 'ropsten',
  avalanche = 'avalanche',
  arbitrum = 'arbitrum',
  fantom = 'fantom',
  celo = 'celo',
  optimism = 'optimism'
}

export type NetworkInfo = {
  network: Network;
  name: string;
  chainId: number;
  explorer: string;
  subsidizedUrl?: string;
  baseAsset: SmallTokenInfoWithIcon & {
    name: string;
  };
  rpcUrl: string;
};

export const networks = new Array<NetworkInfo>(
  {
    chainId: 1,
    name: 'Ethereum',
    network: Network.mainnet,
    explorer: 'https://etherscan.io',
    subsidizedUrl: 'https://api.viamover.com/api/v1',
    baseAsset: {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/info/logo.png'
    },
    rpcUrl: `https://mainnet.infura.io/v3/${APIKeys.INFURA_PROJECT_ID}`
  },
  {
    chainId: 3,
    name: 'Ropsten',
    network: Network.ropsten,
    explorer: 'https://ropsten.etherscan.io',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/info/logo.png'
    },
    rpcUrl: `https://ropsten.infura.io/v3/${APIKeys.INFURA_PROJECT_ID}`
  },
  {
    chainId: 4,
    name: 'Rinkeby',
    network: Network.rinkeby,
    explorer: 'https://rinkeby.etherscan.io',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/info/logo.png'
    },
    rpcUrl: `https://rinkeby.infura.io/v3/${APIKeys.INFURA_PROJECT_ID}`
  },
  {
    chainId: 42,
    name: 'Kovan',
    network: Network.kovan,
    explorer: 'https://kovan.etherscan.io',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/info/logo.png'
    },
    rpcUrl: `https://kovan.infura.io/v3/${APIKeys.INFURA_PROJECT_ID}`
  },
  {
    chainId: 137,
    name: 'Polygon',
    network: Network.polygon,
    explorer: 'https://polygonscan.com/',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'eth',
      decimals: 18,
      symbol: 'MATIC',
      name: 'Matic',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/polygon/info/logo.png'
    },
    rpcUrl: `https://polygon-rpc.com/`
  },
  {
    chainId: 56,
    name: 'Binance Smart Chain',
    network: Network.binance,
    explorer: 'https://bscscan.com',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/info/logo.png'
    },
    rpcUrl: `https://bsc-dataseed.binance.org/`
  },
  {
    chainId: 97,
    name: 'Binance Smart Chain (TEST)',
    network: Network.binanceTest,
    explorer: 'https://testnet.bscscan.com',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/info/logo.png'
    },
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
  },
  {
    chainId: 43114,
    name: 'Avalanche',
    network: Network.avalanche,
    explorer: 'https://snowtrace.io/',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'avax',
      decimals: 9,
      symbol: 'AVAX',
      name: 'Avalanche X-Chain',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/avalanchex/info/logo.png'
    },
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    network: Network.arbitrum,
    explorer: 'https://arbiscan.io/',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'areth',
      decimals: 18,
      symbol: 'ARETH',
      name: 'Arbitrum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/arbitrum/info/logo.png'
    },
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  },
  {
    chainId: 250,
    name: 'Fantom',
    network: Network.fantom,
    explorer: 'https://ftmscan.com',
    subsidizedUrl: undefined,
    baseAsset: {
      address: 'ftm',
      decimals: 18,
      symbol: 'FTM',
      name: 'Fantom',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/fantom/info/logo.png'
    },
    rpcUrl: 'https://rpc.ftm.tools/'
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
