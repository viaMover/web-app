import { ActionTree } from 'vuex';

import { getOlympusData } from '@/services/chain';
import { RootStoreState } from '@/store/types';

import { EarningsOlympusStoreState } from './types';

export default {
  async loadMinimalInfo(): Promise<void> {
    Promise.resolve();
  },
  async loadInfo({ rootState, commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (rootState.account?.networkInfo === undefined) {
        throw new Error('failed to get network info');
      }

      if (rootState.account?.provider === undefined) {
        throw new Error('failed to get provider');
      }

      commit('setOlympusAPY', '7.333');
      const olympusData = await getOlympusData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );
      commit('setOlympusBalance', olympusData.balance);
    } finally {
      commit('setIsLoading', false);
    }
  }
} as ActionTree<EarningsOlympusStoreState, RootStoreState>;
