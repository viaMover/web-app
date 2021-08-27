import { GetterTree } from 'vuex';
import dayjs from 'dayjs';

import { add, multiply } from '@/utils/bigmath';

import { AccountStoreState, TransactionGroup } from '../types';
import { RootStoreState } from '@/store/types';
import { Token, TokenWithBalance, Transaction } from '@/wallet/types';
import { getUSDCAssetData } from '@/wallet/references/data';
import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';

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
      if (state.tokenColorMap === undefined) {
        return '';
      }

      if (address === undefined) {
        return '';
      }

      if (address === 'eth') {
        return '#687ee3';
      }

      return state.tokenColorMap[address.toLowerCase()];
    };
  },
  searchInAllTokens(
    state
  ): (searchTerm: string, offset?: number) => Array<Token> {
    return (searchTerm: string, offset?: number) => {
      const of = offset ?? 0;
      const searchTermProcessed = searchTerm.trim().toLowerCase();
      if (searchTermProcessed === '') {
        console.log('searchInAllTokens', of);
        return state.allTokens.slice(of, of + 100);
      }

      if (state.allTokensSearcher === undefined) {
        return state.allTokens
          .filter(
            (t) =>
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
