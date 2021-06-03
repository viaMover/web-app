import { TokenWithBalance } from '@/store/modules/account/types';
import { ZerionAssetsReceived } from './responses';

export const mapZerionTokens = (
  data: ZerionAssetsReceived
): Array<TokenWithBalance> => {
  const tokens = Object.entries(data.payload.assets).map(([hash, t]) => {
    return {
      address: t.asset.asset_code,
      balance: t.quantity,
      decimals: t.asset.decimals,
      logo: t.asset.icon_url,
      name: t.asset.name,
      symbol: t.asset.symbol,
      priceUSD: t.asset.price?.value ?? '0'
    } as TokenWithBalance;
  });

  return tokens;
};
