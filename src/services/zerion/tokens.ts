import { fromWei } from './../../utils/bigmath';
import { TokenWithBalance } from '@/wallet/types';
import { ZerionAssetsReceived } from './responses';
import { Network } from '@/utils/networkTypes';
import { sameAddress } from '@/utils/address';
import { getMoveAssetData } from '@/wallet/references/data';

export const mapZerionTokens = (
  data: ZerionAssetsReceived,
  network: Network
): Array<TokenWithBalance> => {
  const tokens = Object.entries(data.payload.assets).map(([hash, t]) => {
    let assetName = '';
    let assetSymbol = '';
    if (sameAddress(t.asset.asset_code, getMoveAssetData(network).address)) {
      assetName = 'Mover';
      assetSymbol = 'MOVE';
    } else {
      assetName = t.asset.name;
      assetSymbol = t.asset.symbol;
    }

    return {
      address: t.asset.asset_code,
      balance: fromWei(t.quantity, t.asset.decimals),
      decimals: t.asset.decimals,
      logo: t.asset.icon_url ?? '',
      name: assetName,
      symbol: assetSymbol,
      priceUSD: t.asset.price?.value ? String(t.asset.price?.value) : '0'
    } as TokenWithBalance;
  });

  return tokens;
};
