import dayjs from 'dayjs';

import { GettersFuncs } from '@/store/types';
import { add, multiply } from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { MarketCapSortLimit } from '@/wallet/constants';
import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';
import {
  DisplayableToken,
  Token,
  TokenWithBalance,
  Transaction
} from '@/wallet/types';

import {
  AccountStoreState,
  nativeCurrencyFormatters,
  TransactionGroup
} from './types';

type Getters = {
  getPendingTransactions: Transaction[];
  getPendingOffchainTransactions: Transaction[];
  getTransactionByHash: (hash: string) => Transaction | undefined;
  getTransactionByQueueId: (queueId: string) => Transaction | undefined;
  transactionsGroupedByDay: Array<TransactionGroup>;
  displayableWalletTokens: Array<DisplayableToken>;
  isWalletConnected: boolean;
  isWalletReady: boolean;
  entireBalance: string;
  ethPrice: string;
  baseTokenPrice: string;
  moveNativePrice: string;
  usdcNativePrice: string;
  slpNativePrice: string;
  getTokenColor: (address?: string) => string | undefined;
  getTokenMarketCap: (address?: string) => number;
  searchInAllTokens: (searchTerm: string, offset?: number) => Array<Token>;
  allTokensSortedByMarketCap: Array<Token>;
  searchInWalletTokens: (searchTerm: string) => Array<TokenWithBalance>;
  getOffchainExplorerHanlder: OffchainExplorerHanler | undefined;
  getCurrentAddresses: string[];
  nativeCurrencyFormatter: (value: number | string) => string;
};

const getters: GettersFuncs<Getters, AccountStoreState> = {
  getPendingTransactions(state): Transaction[] {
    return state.transactions.filter((t) => t.status === 'pending');
  },
  getPendingOffchainTransactions(state): Transaction[] {
    return state.transactions.filter(
      (t) => t.status === 'pending' && t.isOffchain === true
    );
  },
  getTransactionByHash(state): (hash: string) => Transaction | undefined {
    return (hash: string): Transaction | undefined => {
      return state.transactions.find((t) => t.hash === hash);
    };
  },
  getTransactionByQueueId(state): (queueId: string) => Transaction | undefined {
    return (queueId: string): Transaction | undefined => {
      return state.transactions.find((t) => t.subsidizedQueueId === queueId);
    };
  },
  transactionsGroupedByDay(state): Array<TransactionGroup> {
    const groupsByDay = state.transactions.reduce(
      (
        res: Record<number, TransactionGroup>,
        tx: Transaction
      ): Record<number, TransactionGroup> => {
        const groupKey = dayjs.unix(tx.timestamp).startOf('day').unix();
        if (res[groupKey] !== undefined) {
          const retVal = { ...res[groupKey] };
          retVal.transactions.push(tx);

          return { ...res, [groupKey]: retVal };
        }

        return {
          ...res,
          [groupKey]: { timeStamp: groupKey, transactions: [tx] }
        };
      },
      {}
    );
    return Object.values(groupsByDay).reverse();
  },
  displayableWalletTokens(state): Array<DisplayableToken> {
    return state.tokens.map((t: TokenWithBalance) => ({
      address: t.address,
      balanceFormatted: formatToDecimals(t.balance, 4),
      symbol: t.symbol,
      name: t.name,
      logo: t.logo,
      balanceNativeFormatted: formatToNative(multiply(t.balance, t.priceUSD))
    }));
  },
  isWalletConnected(state): boolean {
    return state.currentAddress !== undefined;
  },
  isWalletReady(state): boolean {
    return !state.isWalletLoading;
  },
  entireBalance(state, getters, rootState, rootGetters): string {
    let balance = '0';
    balance = state.tokens.reduce<string>((acc, token) => {
      const tokenPrice = multiply(token.balance, token.priceUSD);
      if (tokenPrice) {
        return add(acc, tokenPrice);
      }
      return acc;
    }, '0');

    balance = add(balance, rootGetters['savings/savingsBalanceNative']);

    balance = add(balance, rootGetters['treasury/treasuryStakedBalanceNative']);

    balance = add(balance, rootGetters['treasury/treasuryBonusNative']);

    balance = add(balance, rootGetters['stakingUBT/balanceNative']);

    balance = add(balance, rootGetters['savingsPlus/balanceNative']);

    return balance;
  },
  ethPrice(state): string {
    return state.ethPrice ?? '0';
  },
  baseTokenPrice(state): string {
    return state.ethPrice ?? '0';
  },
  moveNativePrice(state): string {
    if (state.movePriceInWeth === undefined || state.ethPrice === undefined) {
      return '0';
    }
    return multiply(state.movePriceInWeth, state.ethPrice);
  },
  usdcNativePrice(state): string {
    if (state.usdcPriceInNative === undefined) {
      return '0';
    }
    return state.usdcPriceInNative;
  },
  slpNativePrice(state): string {
    if (state.slpPriceInWeth === undefined || state.ethPrice === undefined) {
      return '0';
    }
    return multiply(state.slpPriceInWeth, state.ethPrice);
  },
  getTokenColor(state): (address?: string) => string | undefined {
    return (address?: string) => {
      if (state.tokenInfoMap === undefined) {
        return '';
      }

      if (address === undefined) {
        return '';
      }

      if (address === 'eth') {
        return '#687ee3';
      }

      return state.tokenInfoMap[address.toLowerCase()]?.color;
    };
  },
  getTokenMarketCap(state): (address?: string) => number {
    return (address?: string) => {
      if (state.tokenInfoMap === undefined) {
        return 0;
      }

      if (address === undefined) {
        return 0;
      }

      if (address === 'eth') {
        return Number.MAX_SAFE_INTEGER;
      }

      return state.tokenInfoMap[address.toLowerCase()]?.marketCap ?? 0;
    };
  },
  searchInAllTokens(
    state,
    getters
  ): (searchTerm: string, offset?: number) => Array<Token> {
    return (searchTerm: string, offset?: number) => {
      const of = offset ?? 0;
      const searchTermProcessed = searchTerm.trim().toLowerCase();
      if (searchTermProcessed === '') {
        return getters.allTokensSortedByMarketCap.slice(of, of + 100);
      }

      if (state.allTokensSearcher === undefined) {
        return getters.allTokensSortedByMarketCap
          .filter(
            (t: Token) =>
              t.symbol.toLowerCase().includes(searchTermProcessed) ||
              t.name.toLowerCase().includes(searchTermProcessed) ||
              t.address.toLowerCase().includes(searchTermProcessed)
          )
          .slice(of, of + 100);
      }

      return state.allTokensSearcher
        .search(searchTerm, { limit: 100 })
        .map((res) => res.item);
    };
  },
  allTokensSortedByMarketCap(state): Array<Token> {
    return [...state.allTokens].sort((a: Token, b: Token) => {
      if (
        a.marketCap > MarketCapSortLimit &&
        b.marketCap > MarketCapSortLimit
      ) {
        if (a.marketCap > b.marketCap) {
          return -1;
        }
        if (a.marketCap < b.marketCap) {
          return 1;
        }
      } else if (a.marketCap > MarketCapSortLimit) {
        return -1;
      } else if (b.marketCap > MarketCapSortLimit) {
        return 1;
      }

      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  },
  searchInWalletTokens(state): (searchTerm: string) => Array<TokenWithBalance> {
    return (searchTerm: string) => {
      const searchTermProcessed = searchTerm.trim().toLowerCase();

      if (searchTermProcessed === '') {
        return state.tokens;
      }

      if (state.tokensSearcher === undefined) {
        return state.tokens.filter(
          (t) =>
            t.symbol.toLowerCase().includes(searchTermProcessed) ||
            t.name.toLowerCase().includes(searchTermProcessed) ||
            t.address.toLowerCase().includes(searchTermProcessed)
        );
      }

      return state.tokensSearcher.search(searchTerm).map((res) => res.item);
    };
  },
  getOffchainExplorerHanlder(state): OffchainExplorerHanler | undefined {
    return state.offchainExplorerHanlder;
  },
  getCurrentAddresses(state): string[] {
    return state.addresses;
  },
  nativeCurrencyFormatter(state): (value: number | string) => string {
    const formatter = nativeCurrencyFormatters[state.nativeCurrency];
    if (formatter === undefined) {
      return formatToNative;
    }

    switch (formatter.position) {
      case 'postfix':
        return (value) => `${formatToNative(value)}${formatter.sign}`;
      case 'prefix':
      default:
        return (value) => `${formatter.sign}${formatToNative(value)}`;
    }
  }
};

export type GetterType = typeof getters;
export default getters;
