import { getSweetAndSourData } from './../../../services/chain/nft/sweet-and-sour/index';
import { getUnexpectedMoveData } from '@/services/chain/nft/unexpected-move/index';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { NFTStoreState } from './types';
import * as Sentry from '@sentry/vue';

export default {
  async loadNFTInfo({ rootState, state, commit }): Promise<void> {
    console.log('loadNFTInfo!!!!!!!!!!!!!!!11');
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
      Sentry.captureException('empty currect address in loadNFTInfo');
      return;
    }

    const unexpectedMoveData = await getUnexpectedMoveData(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3
    );
    commit('setUnexpectedMoveData', unexpectedMoveData);

    const sweetAndSourData = await getSweetAndSourData(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3
    );
    commit('setSweetAndSourData', sweetAndSourData);

    commit('setIsLoading', false);
  }
} as ActionTree<NFTStoreState, RootStoreState>;
