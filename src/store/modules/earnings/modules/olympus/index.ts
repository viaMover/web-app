import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { EarningsOlympusStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoading: false,
    error: undefined,

    olympusAPY: undefined
  },
  actions,
  getters,
  mutations
} as Module<EarningsOlympusStoreState, RootStoreState>;
