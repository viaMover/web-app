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
    },
    {
      name: 'IdleUSDC v4',
      wrapToken: {
        symbol: 'idleUSDCYield',
        address: '0x5274891bEC421B39D23760c04A6755eCB444797C',
        decimals: 18
      },
      commonToken: {
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6
      }
    },
    {
      name: 'IdleUSDT v4',
      wrapToken: {
        symbol: 'idleUSDTYield',
        address: '0xF34842d05A1c888Ca02769A633DF37177415C2f8',
        decimals: 18
      },
      commonToken: {
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6
      }
    },
    {
      name: 'IdleSUSD v4',
      wrapToken: {
        symbol: 'idleSUSDYield',
        address: '0xF52CDcD458bf455aeD77751743180eC4A595Fd3F',
        decimals: 18
      },
      commonToken: {
        symbol: 'sUSD',
        address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
        decimals: 18
      }
    },
    {
      name: 'IdleTUSD v4',
      wrapToken: {
        symbol: 'idleTUSDYield',
        address: '0xc278041fDD8249FE4c1Aad1193876857EEa3D68c',
        decimals: 18
      },
      commonToken: {
        symbol: 'TUSD',
        address: '0x0000000000085d4780B73119b644AE5ecd22b376',
        decimals: 18
      }
    },
    {
      name: 'IdleWETH v4',
      wrapToken: {
        symbol: 'idleWETHYield',
        address: '0xC8E6CA6E96a326dC448307A5fDE90a0b21fd7f80',
        decimals: 18
      },
      commonToken: {
        symbol: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18
      }
    },
    {
      name: 'IdleWBTC v4',
      wrapToken: {
        symbol: 'idleWBTCYield',
        address: '0x8C81121B15197fA0eEaEE1DC75533419DcfD3151',
        decimals: 18
      },
      commonToken: {
        symbol: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8
      }
    },
    {
      name: 'IdleRAI',
      wrapToken: {
        symbol: 'idleRAIYield',
        address: '0x5C960a3DCC01BE8a0f49c02A8ceBCAcf5D07fABe',
        decimals: 18
      },
      commonToken: {
        symbol: 'RAI',
        address: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
        decimals: 18
      }
    },
    {
      name: 'IdleFEI',
      wrapToken: {
        symbol: 'idleFEIYield',
        address: '0xb2d5CB72A621493fe83C6885E4A776279be595bC',
        decimals: 18
      },
      commonToken: {
        symbol: 'FEI',
        address: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
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
