import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { getOlympusData, getOlympusPriceInWETH } from '@/services/chain';
import { getOlympusInfo } from '@/services/mover';
import { isError } from '@/services/responses';
import { RootStoreState } from '@/store/types';

import { EarningsOlympusStoreState } from './types';

export default {
  async loadMinimalInfo({ dispatch, commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      await dispatch('fetchOlympusInfo');
      await dispatch('fetchOlympusPriceInWeth');
    } catch (e) {
      console.error('failed olympus/loadMinimalInfo', e);
      Sentry.captureException(e);
    } finally {
      commit('setIsLoading', false);
    }
  },
  async loadInfo({ dispatch, rootState, commit }): Promise<void> {
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

      await dispatch('fetchOlympusInfo');
      await dispatch('fetchOlympusPriceInWeth');
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
  },
  async fetchOlympusPriceInWeth({ commit, rootState }): Promise<void> {
    if (rootState.account?.currentAddress === undefined) {
      throw new Error('failed to get current address');
    }
    if (rootState.account?.networkInfo === undefined) {
      throw new Error('failed to get network info');
    }
    if (rootState.account?.provider === undefined) {
      throw new Error('failed to get provider');
    }

    const olympusPriceInWeth = await getOlympusPriceInWETH(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3
    );
    commit('setOlympusPriceInWeth', olympusPriceInWeth);
  }
} as ActionTree<EarningsOlympusStoreState, RootStoreState>;
