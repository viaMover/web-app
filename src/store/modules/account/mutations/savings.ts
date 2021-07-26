import { MutationTree } from 'vuex';
import { AccountStoreState } from '../types';

export default {
  setSavingsAPY(state, apy: string): void {
    state.savingsAPY = apy;
  },
  setSavingsDPY(state, dpy: string): void {
    state.savingsDPY = dpy;
  },
  setSavingsBalance(state, balance: string): void {
    state.savingsBalance = balance;
  }
} as MutationTree<AccountStoreState>;
