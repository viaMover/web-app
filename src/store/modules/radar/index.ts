import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { RadarStoreState } from './types';
import { RootStoreState } from '@/store/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    isLoadingCuratedList: false,
    isLoadingPersonalList: false,
    loadingPersonalListPromise: null,
    loadingCuratedListPromise: null,
    personalList: [],
    curatedList: []
  },
  actions,
  getters,
  mutations
} as Module<RadarStoreState, RootStoreState>;
