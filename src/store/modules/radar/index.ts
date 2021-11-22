import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { RadarStoreState } from './types';

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
