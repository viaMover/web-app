import * as Sentry from '@sentry/vue';

import {
  getEthereumAPY,
  getEthereumBalance
} from '@/services/chain/earnings/ethereum';
import { getEthereumInfo, getEthereumReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import { checkAccountStateIsReady } from '@/store/modules/account/utils/state';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  EarningsEthereumStoreState,
  FetchEthereumReceiptPayload
} from './types';

type Actions = {
  loadMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
  fetchEthereumInfo: Promise<void>;
  fetchEthereumReceipt: Promise<void>;
};

const actions: ActionFuncs<
  Actions,
  EarningsEthereumStoreState,
  MutationType,
  GetterType
> = {
  async loadMinimalInfo({ dispatch }): Promise<void> {
    await dispatch('fetchEthereumInfo');
  },
  async loadInfo({ commit, rootState, dispatch }): Promise<void> {
    commit('setIsLoading', true);
    try {
      if (!checkAccountStateIsReady(rootState)) {
        throw new Error('failed to get current address');
      }

      const ethereumAPY = await getEthereumAPY(
        rootState.account!.currentAddress!,
        rootState.account!.networkInfo!.network,
        rootState.account!.provider!.web3
      );
      commit('setEthereumAPY', ethereumAPY.apy);

      const ethereumBalance = await getEthereumBalance(
        rootState.account!.currentAddress!,
        rootState.account!.networkInfo!.network,
        rootState.account!.provider!.web3
      );
      commit('setEthereumBalance', ethereumBalance);

      await dispatch('fetchEthereumInfo');
    } catch (e) {
      console.error('failed ethereum/loadInfo: ', e);
      Sentry.captureException(e);
    } finally {
      commit('setIsLoading', false);
    }
  },
  async fetchEthereumInfo({ commit, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('failed to get current address');
    }

    commit('setIsEthereumInfoLoading', true);
    commit('setEthereumInfoError', undefined);
    commit('setEthereumInfo', undefined);

    const info = await getEthereumInfo(rootState.account!.currentAddress!);

    commit('setIsEthereumInfoLoading', false);
    if (isError(info)) {
      commit('setEthereumInfoError', info.error);
      Sentry.captureException(`can't get ethereum info: ${info.error}`);
      return;
    }

    commit('setEthereumInfo', info.result);
  },
  async fetchEthereumReceipt(
    { commit, rootState, state },
    { year, month }: FetchEthereumReceiptPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('failed to get current address');
    }

    commit('setIsEthereumReceiptLoading', true);
    const key = `${year}/${month}`;

    if (state.ethereumReceiptCache[key] !== undefined) {
      return;
    }

    const receipt = await getEthereumReceipt(
      rootState.account!.currentAddress!,
      year,
      month
    );

    commit('setIsEthereumReceiptLoading', false);
    if (isError(receipt)) {
      commit('setEthereumReceiptError', receipt.error);
      Sentry.captureException(`can't get ethereum receipt: ${receipt.error}`);
      return;
    }
    commit('setEthereumReceipt', receipt);
  }
};

export type ActionType = typeof actions;
export default actions;
