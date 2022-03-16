import { RECEIPT_TIME_EXPIRE } from '@/store/modules/savings/actions';
import { INFO_TIME_EXPIRE } from '@/store/modules/treasury/actions';
import { MutationFuncs } from '@/store/types';

import {
  SavingsPlusInfo,
  SavingsPlusStoreState,
  SetSavingsPlusReceiptPayload
} from './types';

type Mutations = {
  setSavingsAPY: void;
  setSavingsDPY: void;
  setSavingsBalance: void;
  setIsSavingsInfoLoading: void;
  setSavingsInfo: void;
  setSavingsReceipt: void;
};

const mutations: MutationFuncs<Mutations, SavingsPlusStoreState> = {
  setSavingsAPY(state, apy: string): void {
    state.APY = apy;
  },
  setSavingsDPY(state, dpy: string): void {
    state.DPY = dpy;
  },
  setSavingsBalance(state, balance: string): void {
    state.balance = balance;
  },
  setIsSavingsInfoLoading(state, isLoading: boolean): void {
    state.isInfoLoading = isLoading;
  },
  setSavingsInfo(state, info: SavingsPlusInfo | undefined): void {
    if (info === undefined) {
      state.info = info;
      return;
    }

    state.info = { data: info, expDate: Date.now() + INFO_TIME_EXPIRE };
  },
  setSavingsReceipt(state, payload: SetSavingsPlusReceiptPayload): void {
    const key = `${payload.year}/${payload.month}`;
    if (payload.receipt === undefined) {
      state.receipts.delete(key);
    } else {
      state.receipts.set(key, {
        data: payload.receipt,
        expDate: Date.now() + RECEIPT_TIME_EXPIRE
      });
    }
  }
};

export type MutationType = typeof mutations;
export default mutations;
