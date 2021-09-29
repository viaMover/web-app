import { Module } from 'vuex';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { ShopStoreState } from './types';
import { RootStoreState } from '@/store/types';
import { isProduction } from '@/settings';

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
