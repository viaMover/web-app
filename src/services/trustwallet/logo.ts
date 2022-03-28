import { Network } from '@/utils/networkTypes';

export const getTokenLogo = (
  checkSumAddress: string,
  network?: Network
): string => {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${getNetworkAlias(
    network
  )}/assets/${checkSumAddress}/logo.png`;
};

const getNetworkAlias = (network?: Network): string => {
  switch (network) {
    case Network.polygon:
      return 'polygon';
    case Network.fantom:
      return 'fantom';
    case Network.mainnet:
    case undefined:
    default:
      return 'ethereum';
  }
};
