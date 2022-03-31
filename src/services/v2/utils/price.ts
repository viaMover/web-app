import { PriceRecord as CoinGeckoPriceRecord } from '@/services/v2/api/coinGecko';
import { PriceRecord as TheGraphPriceRecord } from '@/services/v2/api/theGraph';
import { NativeCurrency } from '@/store/modules/account/types';

type PriceRecord = CoinGeckoPriceRecord | TheGraphPriceRecord;

export const getAssetPrice = (
  priceRecord: PriceRecord,
  address: string,
  currency: NativeCurrency
): string | undefined => {
  const assetRecord:
    | { [nativeCurrency: string]: string | undefined }
    | undefined = priceRecord[address] ?? priceRecord[address.toLowerCase()];
  return assetRecord?.[currency];
};
