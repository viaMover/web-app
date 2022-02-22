import { Network } from '@/utils/networkTypes';

import { Token } from '../types';

const assets = {
  kovan: [
    {
      address: '0xf6e1ac0fd5d90963624124fd20f8a209489d3621',
      decimals: 18,
      symbol: 'MOVE',
      name: 'MOVER',
      priceUSD: '0.5',
      logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C/logo.png',
      isFavorite: true,
      isVerified: true,
      marketCap: 999999999999999999
    },
    {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      priceUSD: '259.2',
      logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
      isFavorite: false,
      isVerified: true,
      marketCap: 999999999999999999
    },
    {
      address: '0x75B0622Cec14130172EaE9Cf166B92E5C112FaFF',
      decimals: 6,
      symbol: 'USDC',
      name: 'USDc',
      priceUSD: '1.0001',
      logo: 'https://s3.amazonaws.com/icons.assets/USDC_mcd.png',
      isFavorite: false,
      isVerified: true,
      marketCap: 999999999999999999
    },
    {
      address: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
      decimals: 18,
      symbol: 'DAI',
      name: 'DAI stablecoin',
      priceUSD: '1.0001',
      logo: 'https://s3.amazonaws.com/icons.assets/DAI_mcd.png',
      isFavorite: false,
      isVerified: true,
      marketCap: 999999999999999999
    }
  ],
  binance: [],
  binanceTest: [],
  mainnet: [],
  polygon: [],
  ropsten: [],
  avalanche: [],
  arbitrum: [],
  fantom: [],
  rinkeby: [
    {
      address: '0xb6c8e5f00117136571d260bfb1baff62ddfd9960',
      decimals: 6,
      symbol: 'USDC',
      name: 'USDc',
      priceUSD: '1.0001',
      logo: 'https://s3.amazonaws.com/icons.assets/USDC_mcd.png',
      isFavorite: false,
      isVerified: true,
      marketCap: 999999999999999999
    }
  ]
};

export const getTestnetAssets = (network: Network): Array<Token> => {
  return assets[network] ?? [];
};
