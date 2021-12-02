import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { getEthereumInfo } from '@/services/mover';
import { isError } from '@/services/responses';
import { RootStoreState } from '@/store/types';

import { EarningsEthereumStoreState } from './types';

export default {
  async loadMinimalInfo({ dispatch }): Promise<void> {
    await dispatch('fetchEthereumInfo');
  },
  async loadInfo({ commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      commit('setEthereumAPY', '8.3');
      commit('setEthereumBalance', '0');
    } finally {
      commit('setIsLoading', false);
    }
  },
  async fetchEthereumInfo({ commit, rootState }): Promise<void> {
    if (rootState.account?.currentAddress === undefined) {
      throw new Error('failed to get current address');
    }

    commit('setIsEthereumInfoLoading', true);
    commit('setEthereumInfoError', undefined);
    commit('setEthereumInfo', undefined);

    const info = await getEthereumInfo(rootState.account.currentAddress);

    commit('setIsEthereumInfoLoading', false);
    if (isError(info)) {
      commit('setEthereumInfoError', info.error);
      Sentry.captureException(`can't get ethereum info: ${info.error}`);
      return;
    }

    commit('setEthereumInfo', info.result);
  }
} as ActionTree<EarningsEthereumStoreState, RootStoreState>;
