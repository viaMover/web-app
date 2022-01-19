import { SavingsInfo, SavingsReceipt } from '@/services/mover';
import { MutationFuncs } from '@/store/types';

import { SavingsStoreState } from './types';

enum Mutations {
  setSavingsAPY,
  setSavingsDPY,
  setSavingsBalance,
  setIsSavingsInfoLoading,
  setSavingsInfoError,
  setSavingsInfo,
  setIsSavingsReceiptLoading,
  setSavingsReceiptError,
  setSavingsReceipt
}

const mutations: MutationFuncs<typeof Mutations, SavingsStoreState> = {
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
};

export type MutationType = typeof mutations;
export default mutations;
