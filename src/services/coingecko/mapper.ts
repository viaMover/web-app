import { Network } from '@/utils/networkTypes';

export type CoingeckoPlatform = 'ethereum' | 'fantom' | 'polygon-pos';

export const getCoingeckoPlatform = (network: Network): CoingeckoPlatform => {
  switch (network) {
    case Network.mainnet:
      return 'ethereum';
    case Network.fantom:
      return 'fantom';
    case Network.polygon:
      return 'polygon-pos';
    default:
      throw new Error(`Can't find coingecko platform for network: ${network}`);
  }
};
