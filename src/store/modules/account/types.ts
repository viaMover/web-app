import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';
import Fuse from 'fuse.js';
import Web3 from 'web3';
import { provider } from 'web3-core';

import { Explorer } from '@/services/explorer';
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

export type AccountStoreState = {
  web3Modal: any;

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

  nativeCurrency: 'usd';
  // main prices in native currency
  ethPrice: undefined | string;
  movePriceInWeth: undefined | string;
  usdcPriceInWeth: undefined | string;
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
};

export type SafeAccountStoreState = AccountStoreState & {
  currentAddress: string;
  networkInfo: NetworkInfo;
  provider: ProviderData;
};

export const ensureAccountStateIsSafe = (
  state: AccountStoreState | undefined
): state is SafeAccountStoreState => {
  const reasons = new Array<string>();
  if (state === undefined) {
    reasons.push('empty account state');
  }

  if (state?.currentAddress === undefined) {
    reasons.push('failed to get currentAddress from state');
  }

  if (state?.provider?.web3 === undefined) {
    reasons.push('failed to get web3 provider from state');
  }

  if (state?.networkInfo?.network === undefined) {
    reasons.push('failed to get network from state');
  }

  if (reasons.length > 0) {
    Sentry.addBreadcrumb({
      type: 'error',
      category: 'state.account.safe',
      data: {
        reasons
      },
      level: Sentry.Severity.Error,
      message: 'account state check failed',
      timestamp: dayjs().unix()
    });

    console.error('account state check failed:', reasons);
    return false;
  }

  return true;
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
