import { sameAddress } from '@/utils/address';
import { Network } from '@/utils/networkTypes';
import { SmallTokenInfo } from '@/wallet/types';

export type WrapTokenData = {
  name: string;
  wrapToken: SmallTokenInfo;
  commonToken: SmallTokenInfo;
};

type wrappedTokenAddressMap = Readonly<Record<Network, Array<WrapTokenData>>>;

export const addresses = {
  [Network.mainnet]: [
    {
      name: 'IdleDAI v4',
      wrapToken: {
        symbol: 'idleDAIYield',
        address: '0x3fE7940616e5Bc47b0775a0dccf6237893353bB4',
        decimals: 18
      },
      commonToken: {
        symbol: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18
      }
    }
  ]
} as wrappedTokenAddressMap;

export const getIdleTokens = (network: Network): Array<WrapTokenData> => {
  return addresses[network];
};

export const getIdleTokenByAddress = (
  address: string,
  network: Network
): WrapTokenData | undefined => {
  return addresses[network].find((vt) =>
    sameAddress(vt.wrapToken.address, address)
  );
};

export const isIdleToken = (address: string, network: Network): boolean => {
  return (
    getIdleTokens(network).find((vt) =>
      sameAddress(vt.wrapToken.address, address)
    ) !== undefined
  );
};
