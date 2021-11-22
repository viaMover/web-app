import { MutationTree } from 'vuex';

import { EarningsEthereumStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setEthereumAPY(state, apy): void {
    state.ethereumAPY = apy;
  }
} as MutationTree<EarningsEthereumStoreState>;
