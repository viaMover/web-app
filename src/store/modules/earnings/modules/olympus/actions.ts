import { ActionTree } from 'vuex';

import { getOlympusData } from '@/services/chain';
import { checkAccountStateIsReady } from '@/store/modules/account/utils/state';
import { RootStoreState } from '@/store/types';

import { EarningsOlympusStoreState } from './types';

export default {
  async loadMinimalInfo(): Promise<void> {
    Promise.resolve();
  },
  async loadInfo({ rootState, commit }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    commit('setIsLoading', true);
    try {
      commit('setOlympusAPY', '7.333');
      const olympusData = await getOlympusData(
        rootState!.account!.currentAddress!,
        rootState!.account!.networkInfo!.network,
        rootState!.account!.provider!.web3
      );
      commit('setOlympusBalance', olympusData.balance);
    } finally {
      commit('setIsLoading', false);
    }
  }
} as ActionTree<EarningsOlympusStoreState, RootStoreState>;
