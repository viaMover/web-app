import {
  MoverAPISavingsPlusService,
  SavingsPlusInfo
} from '@/services/v2/api/mover/savings-plus';
import { SavingsPlusOnChainService } from '@/services/v2/on-chain/mover/savings-plus';
import { RECEIPT_TIME_EXPIRE } from '@/store/modules/savings/actions';
import { INFO_TIME_EXPIRE } from '@/store/modules/treasury/actions';
import { MutationFuncs } from '@/store/types';

import { SavingsPlusStoreState, SetSavingsPlusReceiptPayload } from './types';

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
  },
  setOnChainService(state, service: SavingsPlusOnChainService): void {
    state.onChainService = service;
  },
  setAPIService(state, service: MoverAPISavingsPlusService): void {
    state.apiService = service;
  }
};

export type MutationType = typeof mutations;
export default mutations;
