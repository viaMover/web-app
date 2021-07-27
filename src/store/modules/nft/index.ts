import { Module } from 'vuex';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { NFTStoreState } from './types';
import { RootStoreState } from '@/store/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    isLoading: false,
    loadingPromise: null,
    NFTs: []
  },
  actions,
  getters,
  mutations
} as Module<NFTStoreState, RootStoreState>;
