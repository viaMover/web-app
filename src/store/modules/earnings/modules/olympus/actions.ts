import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsOlympusStoreState } from './types';

export default {
  async loadMinimalInfo(): Promise<void> {
    Promise.resolve();
  },
  async loadInfo({ commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      commit('setOlympusAPY', '7.333');
    } finally {
      commit('setIsLoading', false);
    }
  }
} as ActionTree<EarningsOlympusStoreState, RootStoreState>;
