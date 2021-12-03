import { MutationTree } from 'vuex';

import { OlympusInfo } from '@/services/mover';

import { EarningsOlympusStoreState } from './types';

export default {
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
  }
} as MutationTree<EarningsOlympusStoreState>;
