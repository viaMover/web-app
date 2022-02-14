import { MutationFuncs } from '@/store/types';

import { Asset, RadarStoreState } from './types';

type Mutations = {
  setIsLoadingPersonalList: void;
  setIsLoadingCuratedList: void;
  setLoadingPersonalListPromise: void;
  setLoadingCuratedListPromise: void;
  setCuratedList: void;
  setPersonalList: void;
};

const mutations: MutationFuncs<Mutations, RadarStoreState> = {
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
};

export type MutationType = typeof mutations;
export default mutations;
