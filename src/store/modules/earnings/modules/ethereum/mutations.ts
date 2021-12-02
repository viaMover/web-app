import { MutationTree } from 'vuex';

import { EarningsEthereumStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setEthereumAPY(state, apy): void {
    state.ethereumAPY = apy;
  },
  setEthereumBalance(state, balance): void {
    state.ethereumBalance = balance;
  },
  setEthereumInfo(state, info): void {
    state.ethereumInfo = info;
  },
  setEthereumInfoError(state, error): void {
    state.ethereumInfoError = error;
  },
  setIsEthereumInfoLoading(state, status): void {
    state.isEthereumInfoLoading = status;
  }
} as MutationTree<EarningsEthereumStoreState>;
