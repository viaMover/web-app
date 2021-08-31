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
    UnexpectedMoveTotalAmount: '0',
    UnexpectedMoveTotalClaimed: '0',
    UnexpectedMoveTotalExchanged: '0',

    SweetAndSourTotalAmount: '0',
    SweetAndSourTotalClaimed: '0'
  },
  actions,
  getters,
  mutations
} as Module<NFTStoreState, RootStoreState>;
