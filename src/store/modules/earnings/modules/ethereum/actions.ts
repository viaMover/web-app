import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsEthereumStoreState } from './types';

export default {
  async loadMinimalInfo(): Promise<void> {
    Promise.resolve();
  },
  async loadInfo({ commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      commit('setEthereumAPY', '8.3');
      commit('setEthereumBalance', '0');
    } finally {
      commit('setIsLoading', false);
    }
  }
} as ActionTree<EarningsEthereumStoreState, RootStoreState>;
