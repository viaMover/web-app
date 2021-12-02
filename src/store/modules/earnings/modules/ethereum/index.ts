import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { EarningsEthereumStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoading: false,
    error: undefined,

    ethereumAPY: undefined,
    ethereumBalance: undefined,

    isEthereumInfoLoading: false,
    ethereumInfo: undefined,
    ethereumInfoError: undefined
  },
  actions,
  getters,
  mutations
} as Module<EarningsEthereumStoreState, RootStoreState>;
