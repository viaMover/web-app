import { Network } from '@/utils/networkTypes';

export type CoingeckoPlatfrom = 'ethereum' | 'fantom' | 'polygon-pos';

export const getCoingeckoPlatform = (network: Network): CoingeckoPlatfrom => {
  switch (network) {
    case Network.mainnet:
      return 'ethereum';
    case Network.fantom:
      return 'fantom';
    case Network.polygon:
      return 'polygon-pos';
    default:
      throw new Error(`Can't find coingecko platform fro network: ${network}`);
  }
};
