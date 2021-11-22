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
  }
} as MutationTree<EarningsOlympusStoreState>;
