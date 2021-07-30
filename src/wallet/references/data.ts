import { SmallTokenInfoWithIcon, Token } from './../types';
import { SmallTokenInfo } from '@/wallet/types';
import { Network } from '@/utils/networkTypes';
import HOLY_HAND_ABI from './abi/holy-hand.json';
import HOLY_PASSAGE_ABI from './abi/holy-passage.json';
import HOLY_POOL_ABI from './abi/holy-pool.json';
import HOLY_VISOR_ABI from './abi/holy-visor.json';
import SMART_TREASURY_ABI from './abi/smart-treasury.json';
import BALANCE_CHECKER_ABI from './abi/balances-checker-abi.json';
import ERC20_ABI from './abi/erc20-abi.json';

const ADDRESSES = {
  [Network.mainnet]: {
    MOVE_ADDRESS: '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C',
    HOLY_HAND_ADDRESS: '0x1eF7A557cfA8436ee08790e3F2b190b8937fDa0E',
    HOLY_PASSAGE_ADDRESS: '0x39ac24FD08991B1d69A9ef7189Bc718C988fF5B3',
    HOLY_SAVINGS_POOL_ADDRESS: '0xAF985437DCA19DEFf89e61F83Cd526b272523719',
    HOLY_VISOR_ADDRESS: '0x636356f857f89AF15Cb67735b68B9b673b5Cda6c',
    SMART_TREASURY_ADDRESS: '0x94F748BfD1483750a7dF01aCD993213Ab64C960F',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS:
      '0x87b918e76c92818DB0c76a4E174447aeE6E6D23f',
    UNSIWAP_USDC_WETH_POOL_ADDRESS:
      '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
    USDC_TOKEN_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH_TOKEN_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    BALANCE_CHECKER_ADDRESS: '0x4dcf4562268dd384fe814c00fad239f06c2a0c2b'
  },
  [Network.ropsten]: {
    MOVE_ADDRESS: '0x3B055b3c00E8e27bB84a1E98391443Bff4049129',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0xf413F5b36C3c9C121d2b66858382F0368678CAc1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x39e0Efd667c5760ec98F105eEAd8F8a77d608108',
    HOLY_VISOR_ADDRESS: '0x5c2508fd52DA2AB53361BD24B374bE35ed8cdCF0',
    SMART_TREASURY_ADDRESS: '0x1',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS: '0x1',
    UNSIWAP_USDC_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH_TOKEN_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    BALANCE_CHECKER_ADDRESS: '0xf17adbb5094639142ca1c2add4ce0a0ef146c3f9'
  },
  [Network.kovan]: {
    MOVE_ADDRESS: '0xF6e1AC0Fd5d90963624124fd20f8A209489D3621',
    HOLY_HAND_ADDRESS: '0xA5D1f7a25377187E6c7d0A464D1e51D3Aa697B41',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x8967A200c69136B7c8C768dC9AB58F2e295aD771',
    HOLY_VISOR_ADDRESS: '0x1',
    SMART_TREASURY_ADDRESS: '0xdD17122a055588242c0bF2e6ED84145F4A1e2e40',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS:
      '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    UNSIWAP_USDC_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0x75b0622cec14130172eae9cf166b92e5c112faff',
    WETH_TOKEN_ADDRESS: '0x1',
    BALANCE_CHECKER_ADDRESS: '0xf3352813b612a2d198e437691557069316b84ebe'
  },
  [Network.matic]: {
    MOVE_ADDRESS: '0x521CddC0CBa84F14c69C1E99249F781AA73Ee0BC',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SMART_TREASURY_ADDRESS: '0x1',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS: '0x1',
    UNSIWAP_USDC_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    WETH_TOKEN_ADDRESS: '0xAe740d42E4ff0C5086b2b5b5d149eB2F9e1A754F',
    BALANCE_CHECKER_ADDRESS: '0x9eC70CEa6Ae472a2cdacD5d4A580eC43548c9Afb'
  },
  [Network.binance]: {
    MOVE_ADDRESS: '0x',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SMART_TREASURY_ADDRESS: '0x1',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS: '0x1',
    UNSIWAP_USDC_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    WETH_TOKEN_ADDRESS: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    BALANCE_CHECKER_ADDRESS: '0x9eC70CEa6Ae472a2cdacD5d4A580eC43548c9Afb'
  },
  [Network.binanceTest]: {
    MOVE_ADDRESS: '0x',
    HOLY_HAND_ADDRESS: '0x1',
    HOLY_PASSAGE_ADDRESS: '0x1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x1',
    HOLY_VISOR_ADDRESS: '0x1',
    SMART_TREASURY_ADDRESS: '0x1',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS: '0x1',
    UNSIWAP_USDC_WETH_POOL_ADDRESS: '0x1',
    USDC_TOKEN_ADDRESS: '0x64544969ed7ebf5f083679233325356ebe738930',
    WETH_TOKEN_ADDRESS: '0xf670e09e0221a4100fbc83f4f49eda6e7bc923b0',
    BALANCE_CHECKER_ADDRESS: '0x9eC70CEa6Ae472a2cdacD5d4A580eC43548c9Afb'
  }
};

const SWAP_SOURCES_ICON = {
  '0x': '',
  //Uniswap: '',
  Uniswap_V2: '🦄',
  //Eth2Dai: '',
  'Kyber Network': '',
  Curve: '🧮',
  Balancer: '⚖',
  Balancer_V2: '⚖',
  Bancor: '🕳',
  mStable: '',
  Mooniswap: '🌑',
  Swerve: '',
  SnowSwap: '❄',
  SushiSwap: '🍣',
  'Shell Protocol': '🐚',
  //MultiHop: '',
  DODO: '🐣',
  //DODO_V2: '🐣',
  CREAM: '🍦',
  //LiquidityProvider: '',
  CryptoCom: '🪙',
  Linkswap: '',
  //Lido: '',
  MakerPsm: '',
  KyberDMM: '',
  Smoothy: '',
  Component: '',
  Saddle: '',
  xSigma: '',
  Uniswap_V3: '🦄',
  //Curve_V2: '🧮',
  ShibaSwap: '🐕',
  OasisDEX: '🏝'
} as Record<string, string>;

const FORMAT_SWAP_SOURCES = (tokenName: string): string => {
  return SWAP_SOURCES_ICON[tokenName]
    ? `${tokenName} ${SWAP_SOURCES_ICON[tokenName]}`
    : tokenName;
};

const USDC_TOKEN_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].USDC_TOKEN_ADDRESS
    ? ADDRESSES[network].USDC_TOKEN_ADDRESS
    : '0x1';
};
const WETH_TOKEN_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].WETH_TOKEN_ADDRESS
    ? ADDRESSES[network].WETH_TOKEN_ADDRESS
    : '0x1';
};

const MOVE_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].MOVE_ADDRESS
    ? ADDRESSES[network].MOVE_ADDRESS
    : '0x1';
};

const HOLY_PASSAGE_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].HOLY_PASSAGE_ADDRESS
    ? ADDRESSES[network].HOLY_PASSAGE_ADDRESS
    : '0x1';
};

const HOLY_SAVINGS_POOL_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].HOLY_SAVINGS_POOL_ADDRESS
    ? ADDRESSES[network].HOLY_SAVINGS_POOL_ADDRESS
    : '0x1';
};

const HOLY_HAND_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].HOLY_HAND_ADDRESS
    ? ADDRESSES[network].HOLY_HAND_ADDRESS
    : '0x1';
};

const HOLY_VISOR_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].HOLY_VISOR_ADDRESS
    ? ADDRESSES[network].HOLY_VISOR_ADDRESS
    : '0x1';
};

const SMART_TREASURY_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].SMART_TREASURY_ADDRESS
    ? ADDRESSES[network].SMART_TREASURY_ADDRESS
    : '0x1';
};

const UNISWAP_USDC_WETH_POOL_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].UNSIWAP_USDC_WETH_POOL_ADDRESS
    ? ADDRESSES[network].UNSIWAP_USDC_WETH_POOL_ADDRESS
    : '0x1';
};

const SUSHISWAP_MOVE_WETH_POOL_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].SUSHISWAP_MOVE_WETH_POOL_ADDRESS
    ? ADDRESSES[network].SUSHISWAP_MOVE_WETH_POOL_ADDRESS
    : '0x1';
};

const BALANCE_CHECKER_ADDRESS = (network: Network): string => {
  return ADDRESSES[network].BALANCE_CHECKER_ADDRESS ?? '0x1';
};

const MAX_HOLY_DEPOSIT_AMOUNT_USDC = '10000';

const isTokenValidForTreasuryDeposit = (
  address: string,
  network: Network
): boolean => {
  return (
    address.toUpperCase() === MOVE_ADDRESS(network).toUpperCase() ||
    address.toUpperCase() ===
      SUSHISWAP_MOVE_WETH_POOL_ADDRESS(network).toUpperCase()
  );
};

const getMoveAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: MOVE_ADDRESS(network),
    decimals: 18,
    symbol: 'MOVE',
    iconURL:
      'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/assets/0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C/logo.png'
  };
};

const getMoveWethLPAssetData = (network: Network): SmallTokenInfo => {
  return {
    address: SUSHISWAP_MOVE_WETH_POOL_ADDRESS(network),
    decimals: 18,
    symbol: 'SLP'
  };
};

const getAssetsForTreasury = (
  network: Network,
  moveNativePrice: string,
  slpNativePrice: string
): Array<Token> => {
  const move = getMoveAssetData(network);
  const slp = getMoveWethLPAssetData(network);
  return [
    {
      address: move.address,
      decimals: move.decimals,
      symbol: move.symbol,
      isFavorite: false,
      isVerified: true,
      name: 'Mover',
      priceUSD: moveNativePrice,
      logo: move.iconURL
    },
    {
      address: slp.address,
      decimals: slp.decimals,
      symbol: slp.symbol,
      isFavorite: false,
      isVerified: true,
      name: 'Sushi MOVE-ETH LP',
      priceUSD: slpNativePrice,
      logo: ''
    }
  ];
};

const getUSDCAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: USDC_TOKEN_ADDRESS(network),
    decimals: 6,
    symbol: 'USDC',
    iconURL:
      'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'
  };
};

export {
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData,
  getAssetsForTreasury,
  isTokenValidForTreasuryDeposit,
  HOLY_PASSAGE_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_POOL_ABI,
  HOLY_HAND_ADDRESS,
  HOLY_VISOR_ABI,
  HOLY_HAND_ABI,
  HOLY_SAVINGS_POOL_ADDRESS,
  HOLY_VISOR_ADDRESS,
  MAX_HOLY_DEPOSIT_AMOUNT_USDC,
  SMART_TREASURY_ABI,
  SMART_TREASURY_ADDRESS,
  USDC_TOKEN_ADDRESS,
  SUSHISWAP_MOVE_WETH_POOL_ADDRESS,
  UNISWAP_USDC_WETH_POOL_ADDRESS,
  MOVE_ADDRESS,
  WETH_TOKEN_ADDRESS,
  BALANCE_CHECKER_ADDRESS,
  BALANCE_CHECKER_ABI,
  ERC20_ABI,
  FORMAT_SWAP_SOURCES
};
