import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actionsClaim from './actions/claim';
import actionsInit from './actions/init';
import getters from './getters';
import mutations from './mutations';
import { NFTStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoading: false,

    OlympusTotalClaimed: '0',
    OlympusStartTs: '0',
    OlympusEndTs: '0',
    OlympusBalance: '0',

    UnexpectedMoveTotalAmount: '0',
    UnexpectedMoveTotalClaimed: '0',
    UnexpectedMoveTotalExchanged: '0',
    UnexpectedMoveBalance: '0',

    SweetAndSourTotalAmount: '0',
    SweetAndSourTotalClaimed: '0',

    VaultsTotalAmount: '0',
    VaultsTotalClaimed: '0',

    DiceTotalClaimed: '0',

    nfts: []
  },
  actions: {
    ...actionsInit,
    ...actionsClaim
  },
  getters,
  mutations
} as Module<NFTStoreState, RootStoreState>;
