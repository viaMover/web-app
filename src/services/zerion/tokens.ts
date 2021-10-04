import store from '@/store/index';
import { sameAddress } from '@/utils/address';
import { Network } from '@/utils/networkTypes';
import { getMoveAssetData } from '@/wallet/references/data';
import { TokenWithBalance } from '@/wallet/types';

import { fromWei } from './../../utils/bigmath';
import { MAX_ASSET_NAME } from './../../utils/consts';
import { ZerionAssetsReceived } from './responses';

export const mapZerionTokens = (
  data: ZerionAssetsReceived,
  network: Network
): Array<TokenWithBalance> => {
  const tokens = Object.entries(data.payload.assets)
    .map(([hash, t]) => {
      let assetName = '';
      let assetSymbol = '';
      if (sameAddress(t.asset.asset_code, getMoveAssetData(network).address)) {
        assetName = 'Mover';
        assetSymbol = 'MOVE';
      } else {
        assetName = t.asset.name;
        if (assetName.length > MAX_ASSET_NAME) {
          assetName = assetName.substr(0, MAX_ASSET_NAME);
        }
        assetSymbol = t.asset.symbol;
      }

      if (assetSymbol === 'mobo') {
        assetSymbol = 'MOBO';
      }

      return {
        address: t.asset.asset_code,
        balance: fromWei(t.quantity, t.asset.decimals),
        decimals: t.asset.decimals,
        logo: t.asset.icon_url ?? '',
        name: assetName,
        symbol: assetSymbol,
        priceUSD: t.asset.price?.value ? String(t.asset.price?.value) : '0',
        marketCap: store.getters['account/getTokenMarketCap'](
          t.asset.asset_code
        )
      } as TokenWithBalance;
    })
    .filter((t) => t.decimals > 0);

  return tokens;
};
