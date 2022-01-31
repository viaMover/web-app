import { getTokenLogo } from '@/services/trustwallet/logo';
import { MAX_ASSET_NAME } from '@/utils/consts';
import { Network } from '@/utils/networkTypes';

import { getTestnetAssets } from './references/testnetAssets';
import { Token } from './types';
import assetList from '@/../data/assetList.json';

export const getAllTokens = (network: Network): Array<Token> => {
  let assets: Array<Token>;
  if (network === Network.mainnet) {
    assets = assetList.map(
      (asset) =>
        ({
          address: asset.id,
          decimals: asset.decimals,
          symbol: asset.symbol,
          name:
            asset.name.length > MAX_ASSET_NAME
              ? asset.name.substr(0, MAX_ASSET_NAME)
              : asset.name,
          logo: asset.imageUrl ?? getTokenLogo(asset.id),
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
    return [...acc, t];
  }, new Array<Token>());
};
