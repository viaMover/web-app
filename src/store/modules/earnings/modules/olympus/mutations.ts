import { MutationTree } from 'vuex';

import { EarningsOlympusStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setOlympusAPY(state, apy): void {
    state.olympusAPY = apy;
  },
  setOlympusBalance(state, balance): void {
    state.olympusBalance = balance;
  },
  setOlympusInfo(state, info): void {
    state.olympusInfo = info;
  },
  setOlympusInfoError(state, error): void {
    state.olympusInfoError = error;
  },
  setIsOlympusInfoLoading(state, status): void {
    state.isOlympusInfoLoading = status;
  }
} as MutationTree<EarningsOlympusStoreState>;
