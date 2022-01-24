import * as Sentry from '@sentry/vue';

import { getOlympusData, getOlympusPriceInWETH } from '@/services/chain';
import { getOlympusAPY } from '@/services/chain/earnings/olympys';
import { getOlympusInfo, getOlympusReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import { EarningsOlympusStoreState, FetchOlympusReceiptPayload } from './types';

enum Actions {
  loadMinimalInfo,
  loadInfo,
  fetchOlympusInfo,
  fetchOlympusPriceInWeth,
  fetchOlympusReceipt
}

const actions: ActionFuncs<
  typeof Actions,
  EarningsOlympusStoreState,
  MutationType
> = {
  async loadMinimalInfo({ dispatch, commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      const olympusInfoPromise = dispatch('fetchOlympusInfo');
      const olympusPriceInWethPromise = dispatch('fetchOlympusPriceInWeth');

      await Promise.all([olympusInfoPromise, olympusPriceInWethPromise]);
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

      const olympusAPY = await getOlympusAPY(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );
      commit('setOlympusAPY', olympusAPY.apy);

      const olympusData = await getOlympusData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );
      commit('setOlympusBalance', olympusData.balance);

      const olympusInfoPromise = dispatch('fetchOlympusInfo');
      const olympusPriceInWethPromise = dispatch('fetchOlympusPriceInWeth');

      await Promise.all([olympusInfoPromise, olympusPriceInWethPromise]);
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
  },
  async fetchOlympusReceipt(
    { commit, rootState, state },
    { year, month }: FetchOlympusReceiptPayload
  ): Promise<void> {
    if (rootState.account?.currentAddress === undefined) {
      throw new Error('failed to get current address');
    }
    commit('setIsOlympusReceiptLoading', true);
    const key = `${year}/${month}`;

    if (state.olympusReceiptCache[key] !== undefined) {
      return;
    }

    const receipt = await getOlympusReceipt(
      rootState.account.currentAddress,
      year,
      month
    );

    commit('setIsOlympusReceiptLoading', false);
    if (isError(receipt)) {
      commit('setOlympusReceiptError', receipt.error);
      Sentry.captureException(`can't get olympus receipt: ${receipt.error}`);
      return;
    }
    commit('setOlympusReceipt', receipt);
  }
};

export type ActionType = typeof actions;
export default actions;
