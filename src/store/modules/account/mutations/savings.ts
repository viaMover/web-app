import { MutationTree } from 'vuex';

import { AccountStoreState } from '../types';
import { SavingsInfo, SavingsReceipt } from '@/services/mover';

export default {
  setSavingsAPY(state, apy: string): void {
    state.savingsAPY = apy;
  },
  setSavingsDPY(state, dpy: string): void {
    state.savingsDPY = dpy;
  },
  setSavingsBalance(state, balance: string): void {
    state.savingsBalance = balance;
  },
  setIsSavingsInfoLoading(state, isLoading: boolean): void {
    state.isSavingsInfoLoading = isLoading;
  },
  setSavingsInfoError(state, error: string | undefined): void {
    state.savingsInfoError = error;
  },
  setSavingsInfo(state, info: SavingsInfo | undefined): void {
    state.savingsInfo = info;
  },
  setIsSavingsReceiptLoading(state, isLoading: boolean): void {
    state.isSavingsReceiptLoading = isLoading;
  },
  setSavingsReceiptError(state, error: string | undefined): void {
    state.savingsReceiptError = error;
  },
  setSavingsReceipt(state, receipt: SavingsReceipt): void {
    state.savingsReceipt = receipt;
  }
} as MutationTree<AccountStoreState>;
