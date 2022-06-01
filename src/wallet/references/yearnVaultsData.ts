import { sameAddress } from '@/utils/address';
import { Network } from '@/utils/networkTypes';
import { SmallTokenInfo } from '@/wallet/types';

export type YearnVaultData = {
  name: string;
  vaultToken: SmallTokenInfo;
  commonToken: SmallTokenInfo;
};

type vaultAddressMap = Readonly<Record<Network, Array<YearnVaultData>>>;

const addresses = {
  [Network.mainnet]: [
    {
      name: 'YV_USDC',
      vaultToken: {
        symbol: 'yvUSDC',
        address: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
        decimals: 6
      },
      commonToken: {
        symbol: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6
      }
    },
    {
      name: 'YV_DAI',
      vaultToken: {
        symbol: 'yvDAI',
        address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
        decimals: 18
      },
      commonToken: {
        symbol: 'DAI',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        decimals: 18
      }
    }
  ]
} as vaultAddressMap;

export const getSimpleYearnVaultTokens = (
  network: Network
): Array<YearnVaultData> => {
  return addresses[network];
};

export const getSimpleYearnVaultTokenByAddress = (
  address: string,
  network: Network
): YearnVaultData | undefined => {
  return addresses[network].find((vt) =>
    sameAddress(vt.vaultToken.address, address)
  );
};

export const isSimpleYearnVaultMultiplier = (
  address: string,
  network: Network
): boolean => {
  return (
    getSimpleYearnVaultTokens(network).find((vt) =>
      sameAddress(vt.vaultToken.address, address)
    ) !== undefined
  );
};
