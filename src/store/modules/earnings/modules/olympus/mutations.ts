import { OlympusInfo } from '@/services/mover';
import { MutationFuncs } from '@/store/types';

import { EarningsOlympusStoreState, SetOlympusReceiptPayload } from './types';

type Mutations = {
  setIsLoading: void;
  setOlympusAPY: void;
  setOlympusBalance: void;
  setOlympusInfo: void;
  setOlympusInfoError: void;
  setIsOlympusInfoLoading: void;
  setOlympusPriceInWeth: void;
  setOlympusReceipt: void;
  setOlympusReceiptError: void;
  setIsOlympusReceiptLoading: void;
};

const mutations: MutationFuncs<Mutations, EarningsOlympusStoreState> = {
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  setOlympusAPY(state, apy: string | undefined): void {
    state.olympusAPY = apy;
  },
  setOlympusBalance(state, balance: string | undefined): void {
    state.olympusBalance = balance;
  },
  setOlympusInfo(state, info: OlympusInfo | undefined): void {
    state.olympusInfo = info;
  },
  setOlympusInfoError(state, error: string | undefined): void {
    state.olympusInfoError = error;
  },
  setIsOlympusInfoLoading(state, status: boolean): void {
    state.isOlympusInfoLoading = status;
  },
  setOlympusPriceInWeth(state, olympusPriceInWeth: string | undefined): void {
    state.olympusPriceInWeth = olympusPriceInWeth;
  },
  setOlympusReceipt(state, payload: SetOlympusReceiptPayload): void {
    state.olympusReceiptCache[`${payload.year}/${payload.month}`] =
      payload.receipt;
  },
  setOlympusReceiptError(state, error: string | undefined): void {
    state.olympusReceiptError = error;
  },
  setIsOlympusReceiptLoading(state, status: boolean): void {
    state.isOlympusReceiptLoading = status;
  }
};

export type MutationType = typeof mutations;
export default mutations;
