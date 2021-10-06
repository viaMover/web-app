import { MutationTree } from 'vuex';

import { Asset, RadarStoreState } from './types';

export default {
  setIsLoadingPersonalList(state, isLoading): void {
    state.isLoadingPersonalList = isLoading;
  },
  setIsLoadingCuratedList(state, isLoading): void {
    state.isLoadingCuratedList = isLoading;
  },
  setLoadingPersonalListPromise(
    state,
    loadingPromise: Promise<Array<Asset>> | undefined
  ): void {
    state.loadingPersonalListPromise = loadingPromise;
  },
  setLoadingCuratedListPromise(
    state,
    loadingPromise: Promise<Array<Asset>> | undefined
  ): void {
    state.loadingCuratedListPromise = loadingPromise;
  },
  setPersonalList(state, list: Array<Asset> | undefined): void {
    state.personalList = list;
  },
  setCuratedList(state, list: Array<Asset> | undefined): void {
    state.curatedList = list;
  }
} as MutationTree<RadarStoreState>;
