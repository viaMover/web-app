import { Module } from 'vuex';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { ShopStoreState } from './types';
import { RootStoreState } from '@/store/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    assets: [],
    isLoading: false,
    loadingPromise: null
  },
  actions,
  getters,
  mutations
} as Module<ShopStoreState, RootStoreState>;
