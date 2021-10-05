import { MutationTree } from 'vuex';

import { Transaction } from '@/wallet/types';

import { AccountStoreState } from '../types';
import { sortAndDeduplicateTransactions } from '../utils/transactions';

export default {
  addTransaction(state, newTransaction: Transaction): void {
    state.transactions = sortAndDeduplicateTransactions([
      newTransaction,
      ...state.transactions
    ]);
  },
  setWalletTransactions(state, transactions: Array<Transaction>): void {
    state.transactions = sortAndDeduplicateTransactions(transactions);
  },
  updateWalletTransactions(state, newTransactions: Array<Transaction>): void {
    const allTransactions = [...newTransactions, ...state.transactions];
    state.transactions = sortAndDeduplicateTransactions(allTransactions);
  },
  removeWalletTransaction(state, removeHashes: Array<string>): void {
    state.transactions = state.transactions.filter(
      (t: Transaction) => !removeHashes.includes(t.hash)
    );
  }
} as MutationTree<AccountStoreState>;
