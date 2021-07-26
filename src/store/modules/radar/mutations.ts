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
    loadingPromise: Promise<Array<Asset>>
  ): void {
    state.loadingPersonalListPromise = loadingPromise;
  },
  setLoadingCuratedListPromise(
    state,
    loadingPromise: Promise<Array<Asset>>
  ): void {
    state.loadingCuratedListPromise = loadingPromise;
  },
  setPersonalList(state, list: Array<Asset>): void {
    state.personalList = list;
  },
  setCuratedList(state, list: Array<Asset>): void {
    state.curatedList = list;
  }
} as MutationTree<RadarStoreState>;
