import { Module } from 'vuex';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { RadarStoreState } from './types';
import { RootStoreState } from '@/store/types';
import { isProduction } from '@/settings';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoadingCuratedList: false,
    isLoadingPersonalList: false,
    loadingPersonalListPromise: undefined,
    loadingCuratedListPromise: undefined,
    personalList: undefined,
    curatedList: undefined
  },
  actions,
  getters,
  mutations
} as Module<RadarStoreState, RootStoreState>;
