import { OlympusInfo } from '@/services/mover';
import { MutationFuncs } from '@/store/types';

import { EarningsOlympusStoreState, SetOlympusReceiptPayload } from './types';

enum Mutations {
  setIsLoading,
  setOlympusAPY,
  setOlympusBalance,
  setOlympusInfo,
  setOlympusInfoError,
  setIsOlympusInfoLoading,
  setOlympusPriceInWeth,
  setOlympusReceipt,
  setOlympusReceiptError,
  setIsOlympusReceiptLoading
}

const mutations: MutationFuncs<typeof Mutations, EarningsOlympusStoreState> = {
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
