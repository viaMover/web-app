import { Module } from 'vuex';

import actionsInit from './actions/init';
import actionsClaim from './actions/claim';
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
    UnexpectedMoveBalance: '0',

    SweetAndSourTotalAmount: '0',
    SweetAndSourTotalClaimed: '0'
  },
  actions: {
    ...actionsInit,
    ...actionsClaim
  },
  getters,
  mutations
} as Module<NFTStoreState, RootStoreState>;
