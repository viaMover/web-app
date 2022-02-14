import { SavingsInfo } from '@/services/mover';
import { RECEIPT_TIME_EXPIRE } from '@/store/modules/savings/actions';
import { INFO_TIME_EXPIRE } from '@/store/modules/treasury/actions';
import { MutationFuncs } from '@/store/types';

import { SavingsStoreState, SetSavingsReceiptPayload } from './types';

type Mutations = {
  setSavingsAPY: void;
  setSavingsDPY: void;
  setSavingsBalance: void;
  setIsSavingsInfoLoading: void;
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
  setSavingsInfo(state, info: SavingsInfo | undefined): void {
    if (info === undefined) {
      state.savingsInfo = info;
      return;
    }

    state.savingsInfo = { data: info, expDate: Date.now() + INFO_TIME_EXPIRE };
  },
  setSavingsReceipt(state, payload: SetSavingsReceiptPayload): void {
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
