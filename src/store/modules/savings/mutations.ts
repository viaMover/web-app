import { SavingsInfo } from '@/services/mover';
import { MutationFuncs } from '@/store/types';

import { SavingsStoreState, SetSavingsReceiptPayload } from './types';

type Mutations = {
  setSavingsAPY: void;
  setSavingsDPY: void;
  setSavingsBalance: void;
  setIsSavingsInfoLoading: void;
  setSavingsInfoError: void;
  setSavingsInfo: void;
  setSavingsReceipt: void;
};

const mutations: MutationFuncs<Mutations, SavingsStoreState> = {
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
  setSavingsReceipt(state, payload: SetSavingsReceiptPayload): void {
    if (payload.receipt === undefined) {
      state.receipts[`${payload.year}/${payload.month}`] = undefined;
    } else {
      state.receipts[`${payload.year}/${payload.month}`] = {
        data: payload.receipt,
        expDate: Date.now() + 600000 // add 10 min
      };
    }
  }
};

export type MutationType = typeof mutations;
export default mutations;
