import { sameAddress } from '@/utils/address';
import { Network } from '@/utils/networkTypes';
import { SmallTokenInfo } from '@/wallet/types';

export type YearnVaultData = {
  name: string;
  vaultToken: SmallTokenInfo;
  commonToken: SmallTokenInfo;
};

type vaultAddressMap = Readonly<Record<Network, Array<YearnVaultData>>>;

export const addresses = {
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
    },
    {
      name: 'YV_WETH',
      vaultToken: {
        symbol: 'yvWETH',
        address: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
        decimals: 18
      },
      commonToken: {
        symbol: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18
      }
    },
    {
      name: 'YV_WBTC',
      vaultToken: {
        symbol: 'yvWBTC',
        address: '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
        decimals: 8
      },
      commonToken: {
        symbol: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8
      }
    },
    {
      name: 'YV_SUSHI',
      vaultToken: {
        symbol: 'yvSUSHI',
        address: '0x6d765CbE5bC922694afE112C140b8878b9FB0390',
        decimals: 18
      },
      commonToken: {
        symbol: 'SUSHI',
        address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        decimals: 18
      }
    },
    {
      name: 'YV_YFI',
      vaultToken: {
        symbol: 'yvYFI',
        address: '0xdb25cA703181E7484a155DD612b06f57E12Be5F0',
        decimals: 18
      },
      commonToken: {
        symbol: 'YFI',
        address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
        decimals: 18
      }
    },
    {
      name: 'YV_LUSD',
      vaultToken: {
        symbol: 'yvLUSD',
        address: '0x378cb52b00F9D0921cb46dFc099CFf73b42419dC',
        decimals: 18
      },
      commonToken: {
        symbol: 'LUSD',
        address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        decimals: 18
      }
    },
    {
      name: 'YV_SNX',
      vaultToken: {
        symbol: 'yvSNX',
        address: '0xF29AE508698bDeF169B89834F76704C3B205aedf',
        decimals: 18
      },
      commonToken: {
        symbol: 'SNX',
        address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
        decimals: 18
      }
    },
    {
      name: 'YV_AAVE',
      vaultToken: {
        symbol: 'yvAAVE',
        address: '0xd9788f3931Ede4D5018184E198699dC6d66C1915',
        decimals: 18
      },
      commonToken: {
        symbol: 'AAVE',
        address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        decimals: 18
      }
    },
    {
      name: 'YV_UNI',
      vaultToken: {
        symbol: 'yvUNI',
        address: '0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42',
        decimals: 18
      },
      commonToken: {
        symbol: 'UNI',
        address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
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

export const isSimpleYearnVault = (
  address: string,
  network: Network
): boolean => {
  return (
    getSimpleYearnVaultTokens(network).find((vt) =>
      sameAddress(vt.vaultToken.address, address)
    ) !== undefined
  );
};
