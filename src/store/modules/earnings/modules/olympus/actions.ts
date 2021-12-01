import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { getOlympusData } from '@/services/chain';
import { getSavingsInfo } from '@/services/mover';
import { getOlympusInfo } from '@/services/mover/earnings/service';
import { isError } from '@/services/responses';
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
    } catch (e) {
      console.error('failed olympus/loadInfo: ', e);
      Sentry.captureException(e);
    } finally {
      commit('setIsLoading', false);
    }
  },
  async fetchOlympusInfo({ commit, rootState }): Promise<void> {
    if (rootState.account?.currentAddress === undefined) {
      throw new Error('failed to get current address');
    }

    commit('setIsOlympusInfoLoading', true);
    commit('setOlympusInfoError', undefined);
    commit('setOlympusInfo', undefined);

    const info = await getOlympusInfo(rootState.account.currentAddress);

    commit('setIsOlympusInfoLoading', false);
    if (isError(info)) {
      commit('setOlympusInfoError', info.error);
      Sentry.captureException(`can't get olympus info: ${info.error}`);
      return;
    }

    commit('setOlympusInfo', info.result);
  }
} as ActionTree<EarningsOlympusStoreState, RootStoreState>;
