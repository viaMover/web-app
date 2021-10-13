import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { ShopStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    assets: [],
    isLoading: false,
    loadingPromise: null
  },
  actions,
  getters,
  mutations
} as Module<ShopStoreState, RootStoreState>;
