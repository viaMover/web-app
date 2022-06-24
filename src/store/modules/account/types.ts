import UAuthSPA from '@uauth/js';
import { IUAuthOptions } from '@uauth/web3modal';
import Fuse from 'fuse.js';
import Web3 from 'web3';
import { provider } from 'web3-core';

import { Explorer } from '@/services/explorer';
import { CoinGeckoAPIService } from '@/services/v2/api/coinGecko';
import { MoverAssetsService } from '@/services/v2/api/mover/assets/MoverAssetsService';
import { SwapAPIService } from '@/services/v2/api/swap';
import { TheGraphAPIService } from '@/services/v2/api/theGraph';
import { SwapOnChainService } from '@/services/v2/on-chain/mover/swap';
import { APIKeys } from '@/settings';
import { Network, NetworkInfo } from '@/utils/networkTypes';
import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';
import { GasData, Token, TokenWithBalance, Transaction } from '@/wallet/types';

export type ChartPair = [number, number];

export type TransactionGroup = {
  timeStamp: number;
  transactions: Array<Transaction>;
};

export type AccountData = {
  addresses: Array<string>;
  balance: string | undefined;
  networkId: number | undefined;
};

export type ProviderData = {
  web3: Web3;
  pureProvider: any;
  providerBeforeClose: () => void;
};

export type Avatar = {
  id: string;
  color: string;
} & (
  | { type: 'symbol'; symbol: string }
  | { type: 'image'; imageSrc: string; imageAlt: string }
);

export enum NativeCurrency {
  Bitcoin = 'btc',
  Ether = 'eth',
  USD = 'usd',
  EUR = 'eur',
  GBP = 'gbp',
  RUB = 'rub'
}

export type AccountStoreState = {
  web3Modal: any;
  uauthClient: UAuthSPA;
  unstoppableDomainsName: string | undefined;

  avatar: Avatar | undefined;
  avatars: Array<Avatar>;
  addresses: Array<string>;
  balance: undefined | string;
  networkInfo: undefined | NetworkInfo;
  currentAddress: undefined | string;

  availableNetworks: Array<Network>;

  isTransactionsListLoaded: boolean;
  transactions: Array<Transaction>;

  tokens: Array<TokenWithBalance>;
  isTokensListLoaded: boolean;
  tokensSearcher: Fuse<TokenWithBalance> | undefined;
  allTokens: Array<Token>;
  allTokensSearcher: Fuse<Token> | undefined;
  tokenInfoMap: Record<string, Token> | undefined;
  provider: ProviderData | undefined;
  isDetecting: boolean;
  isWalletLoading: boolean;
  refreshError: undefined | string;

  nativeCurrency: NativeCurrency;
  // main prices in native currency
  ethPrice: undefined | string;
  movePriceInWeth: undefined | string;
  usdcPriceInNative: undefined | string;
  slpPriceInWeth: undefined | string;
  eursPriceInWeth: undefined | string;

  // explorer
  explorer: undefined | Explorer;
  offchainExplorerHanlder: undefined | OffchainExplorerHanler;
  //charts
  chartData: undefined | Record<string, ChartPair[]>;

  gasPrices: GasData | undefined;
  gasUpdating: boolean;
  gasUpdaterHandle: number | undefined;
  gasUpdaterCallers: Array<string>;
  isDebitCardSectionVisible: boolean;
  isDepositCardSectionVisible: boolean;
  isOrderOfLibertySectionVisible: boolean;

  swapAPIService: SwapAPIService | undefined;
  swapOnChainService: SwapOnChainService | undefined;

  coinGeckoAPIService: CoinGeckoAPIService | undefined;
  theGraphAPIService: TheGraphAPIService | undefined;

  assetService: MoverAssetsService | undefined;
};

export type SafeAccountStoreState = AccountStoreState & {
  currentAddress: string;
  networkInfo: NetworkInfo;
  provider: ProviderData;
};

export const ensureAccountStateIsSafe = (
  state: AccountStoreState | undefined
): state is SafeAccountStoreState => {
  if (state === undefined) {
    return false;
  }

  if (state?.currentAddress === undefined) {
    return false;
  }

  if (state?.provider?.web3 === undefined) {
    return false;
  }

  return state?.networkInfo?.network !== undefined;
};

export type EmitChartRequestPayload = {
  assetCode: string;
  nativeCurrency: string;
  chartsType: string;
};

export type RefreshWalletPayload = {
  injected: boolean;
  init: boolean;
};

export type InitWalletPayload = {
  provider: provider;
  injected: boolean;
  providerBeforeCloseCb: () => void;
};

export const nativeCurrencyFormatters = {
  [NativeCurrency.USD]: {
    sign: '$',
    currency: 'USD',
    position: 'prefix'
  },
  [NativeCurrency.GBP]: {
    sign: '£',
    currency: 'GBP',
    position: 'prefix'
  },
  [NativeCurrency.EUR]: {
    sign: '€',
    currency: 'EUR',
    position: 'prefix'
  },
  [NativeCurrency.RUB]: {
    sign: '₽',
    currency: 'RUB',
    position: 'postfix'
  },
  [NativeCurrency.Ether]: {
    sign: 'Ξ',
    currency: 'ETH',
    position: 'prefix'
  },
  [NativeCurrency.Bitcoin]: {
    sign: '₿',
    currency: 'BTC',
    position: 'prefix'
  }
};

export type PriceRecord = {
  [address: string]: {
    [currency: string]: string;
  };
};

export type FetchTokenPricesByContractAddressesPayload = {
  contractAddresses: Array<string> | string;
  currencies: Array<NativeCurrency> | NativeCurrency;
};

export const uauthOptions: IUAuthOptions = {
  clientID: APIKeys.UNSTOPPABLE_DOMAINS_LOGIN_CLIENT_ID,
  redirectUri: `${window.location.protocol}//${window.location.host}`,
  scope: 'openid wallet'
};
