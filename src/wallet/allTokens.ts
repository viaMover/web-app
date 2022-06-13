import { getTokenLogo } from '@/services/trustwallet/logo';
import { MAX_ASSET_NAME } from '@/utils/consts';
import { Network } from '@/utils/networkTypes';

import { getTestnetAssets } from './references/testnetAssets';
import { Token } from './types';
import assetListEth from '@/../data/assets/assetList-ethereum.json';
import assetListFantom from '@/../data/assets/assetList-fantom.json';
import assetListPolygon from '@/../data/assets/assetList-polygon.json';

type AssetListType = {
  id: string;
  decimals: number;
  symbol: string;
  name: string;
  color?: string;
  marketCap?: number;
  imageUrl?: string;
};

export const availableNetworks = [
  Network.mainnet,
  Network.fantom,
  Network.polygon,
  Network.avalanche,
  Network.binance
];

const getAssetList = (network: Network): Array<AssetListType> => {
  switch (network) {
    case Network.mainnet:
      return assetListEth;
    case Network.fantom:
      return assetListFantom;
    case Network.polygon:
      return assetListPolygon;
    default:
      return [];
  }
};
export const getAllTokens = (network: Network): Array<Token> => {
  let assets: Array<Token>;
  if (availableNetworks.includes(network)) {
    assets = getAssetList(network).map(
      (asset) =>
        ({
          address: asset.id,
          decimals: asset.decimals,
          symbol: asset.symbol,
          name: asset.name.slice(0, MAX_ASSET_NAME),
          logo: asset.imageUrl ?? getTokenLogo(asset.id, network),
          color: asset.color,
          marketCap: asset.marketCap ?? 0,
          priceUSD: '0'
        } as Token)
    );
  } else {
    assets = getTestnetAssets(network);
  }
  return deduplicateByAddress(
    assets.sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
  );
};

const deduplicateByAddress = (tokens: Array<Token>): Array<Token> => {
  const knownAddresses = new Set();
  return tokens.reduce((acc, t) => {
    if (knownAddresses.has(t.address)) {
      return acc;
    }

    knownAddresses.add(t.address);
    acc.push(t);
    return acc;
  }, new Array<Token>());
};
