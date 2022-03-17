import {
  MoverAPISavingsService,
  SavingsInfo
} from '@/services/v2/api/mover/savings';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings';
import {
  INFO_TIME_EXPIRE,
  RECEIPT_TIME_EXPIRE
} from '@/store/modules/savings/actions';
import { MutationFuncs } from '@/store/types';

import { SavingsStoreState, SetSavingsReceiptPayload } from './types';

type Mutations = {
  setSavingsAPY: void;
  setSavingsDPY: void;
  setSavingsBalance: void;
  setIsSavingsInfoLoading: void;
  setSavingsInfo: void;
  setSavingsReceipt: void;
  setOnChainService: void;
  setAPIService: void;
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
  },
  setOnChainService(state, service: SavingsOnChainService): void {
    state.onChainService = service;
  },
  setAPIService(state, service: MoverAPISavingsService): void {
    state.apiService = service;
  }
};

export type MutationType = typeof mutations;
export default mutations;
