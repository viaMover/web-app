import { MAX_ASSET_NAME } from './../utils/consts';
import { Network } from '@/utils/networkTypes';
import { Token } from './types';
import assetList from '@/../data/assetList.json';
import { getTokenLogo } from '@/services/trustwallet/logo';
import { getTestnetAssets } from './references/testnetAssets';

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
          logo: getTokenLogo(asset.id),
          color: asset.color,
          marketCap: asset.marketCap ?? 0
        } as Token)
    );
  } else {
    assets = getTestnetAssets(network);
  }
  return assets.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
};
