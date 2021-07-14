import { fromWei } from './../../utils/bigmath';
import { TokenWithBalance } from '@/wallet/types';
import { ZerionAssetsReceived } from './responses';

export const mapZerionTokens = (
  data: ZerionAssetsReceived
): Array<TokenWithBalance> => {
  const tokens = Object.entries(data.payload.assets).map(([hash, t]) => {
    return {
      address: t.asset.asset_code,
      balance: fromWei(t.quantity, t.asset.decimals),
      decimals: t.asset.decimals,
      logo: t.asset.icon_url,
      name: t.asset.name,
      symbol: t.asset.symbol,
      priceUSD: t.asset.price?.value ? String(t.asset.price?.value) : '0'
    } as TokenWithBalance;
  });

  return tokens;
};
