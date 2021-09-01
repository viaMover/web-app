import { ActionTree } from 'vuex';
import * as Sentry from '@sentry/vue';

import { getSweetAndSourData, getUnexpectedMoveData } from '@/services/chain';
import { RootStoreState } from '@/store/types';
import { NFTStoreState } from './types';

export default {
  async loadNFTInfo({ rootState, state, commit }): Promise<void> {
    commit('setIsLoading', true);

    if (rootState.account === undefined) {
      commit('setIsLoading', false);
      console.error('empty account state in loadNFTInfo');
      Sentry.captureException('empty account state in loadNFTInfo');
      return;
    }

    if (rootState.account.networkInfo?.network === undefined) {
      commit('setIsLoading', false);
      console.error('empty network in loadNFTInfo');
      Sentry.captureException('empty network in loadNFTInfo');
      return;
    }

    if (rootState.account.provider?.web3 === undefined) {
      commit('setIsLoading', false);
      console.error('empty web3 provider in loadNFTInfo');
      Sentry.captureException('empty web3 provider in loadNFTInfo');
      return;
    }

    if (rootState.account.currentAddress === undefined) {
      commit('setIsLoading', false);
      console.error('empty current address in loadNFTInfo');
      Sentry.captureException('empty current address in loadNFTInfo');
      return;
    }

    const unexpectedMoveDataPromise = getUnexpectedMoveData(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3
    );

    const sweetAndSourDataPromise = getSweetAndSourData(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3
    );

    try {
      const [unexpectedMoveData, sweetAndSourData] = await Promise.all([
        unexpectedMoveDataPromise,
        sweetAndSourDataPromise
      ]);
      commit('setUnexpectedMoveData', unexpectedMoveData);
      commit('setSweetAndSourData', sweetAndSourData);
    } catch (err) {
      console.error("can't load nft's data", err);
      Sentry.captureException(err);
    } finally {
      commit('setIsLoading', false);
    }
  }
} as ActionTree<NFTStoreState, RootStoreState>;
