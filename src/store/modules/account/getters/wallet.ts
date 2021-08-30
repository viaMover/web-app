import { GetterTree } from 'vuex';
import dayjs from 'dayjs';

import { add, multiply } from '@/utils/bigmath';

import { AccountStoreState, TransactionGroup } from '../types';
import { RootStoreState } from '@/store/types';
import { Token, TokenWithBalance, Transaction } from '@/wallet/types';
import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';
import { MarketCapSortLimit } from '@/wallet/constants';

export default {
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
  isWalletConnected(state): boolean {
    return state.currentAddress !== undefined;
  },
  isWalletReady(state, getters): boolean {
    return (
      getters.isWalletConnected &&
      state.provider !== undefined &&
      !state.isDetecting &&
      state.savingsInfo !== undefined &&
      state.treasuryInfo !== undefined
    );
  },
  entireBalance(state, getters): string {
    let balance = '0';
    balance = state.tokens.reduce<string>((acc, token) => {
      const tokenPrice = multiply(token.balance, token.priceUSD);
      if (tokenPrice) {
        return add(acc, tokenPrice);
      }
      return acc;
    }, '0');

    if (state.networkInfo !== undefined && state.savingsBalance !== undefined) {
      balance = add(
        balance,
        multiply(state.savingsBalance, getters.usdcNativePrice)
      );
    }

    balance = add(balance, getters.treasuryStakedBalanceNative);

    balance = add(balance, getters.treasuryBonusNative);

    return balance;
  },
  ethPrice(state): string {
    return state.ethPrice ?? '0';
  },
  moveNativePrice(state): string {
    if (state.movePriceInWeth === undefined || state.ethPrice === undefined) {
      return '0';
    }
    return multiply(state.movePriceInWeth, state.ethPrice);
  },
  usdcNativePrice(state): string {
    if (state.usdcPriceInWeth === undefined || state.ethPrice === undefined) {
      return '0';
    }
    return multiply(state.usdcPriceInWeth, state.ethPrice);
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
              t.name.toLowerCase().includes(searchTermProcessed)
          )
          .slice(of, of + 100);
      }

      return state.allTokensSearcher
        .search(searchTerm, { limit: 100 })
        .map((res) => res.item);
    };
  },
  allTokensSortedByMarketCap(state): Array<Token> {
    return state.allTokens.sort((a: Token, b: Token) => {
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
            t.name.toLowerCase().includes(searchTermProcessed)
        );
      }

      const res = state.tokensSearcher
        .search(searchTerm)
        .map((res) => res.item);

      return res;
    };
  },
  getOffchainExplorerHanlder(state): OffchainExplorerHanler | undefined {
    return state.offchainExplorerHanlder;
  },
  getCurrentAddresses(state): string[] {
    return state.addresses;
  }
} as GetterTree<AccountStoreState, RootStoreState>;
