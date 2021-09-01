import { checkAccountStateIsReady } from './../../account/utils/state';
import { ActionTree } from 'vuex';
import * as Sentry from '@sentry/vue';

import { getSweetAndSourData, getUnexpectedMoveData } from '@/services/chain';
import { RootStoreState } from '@/store/types';
import { NFTStoreState } from './../types';

export default {
  async loadNFTInfo({ rootState, state, commit }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    commit('setIsLoading', true);

    const unexpectedMoveDataPromise = getUnexpectedMoveData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    const sweetAndSourDataPromise = getSweetAndSourData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
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
