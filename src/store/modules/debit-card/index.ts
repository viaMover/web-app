import { Module } from 'vuex';

import { RootStoreState } from '@/store/types';

import actions from './actions';
import { allSkins, defaultSkin } from './consts';
import getters from './getters';
import mutations from './mutations';
import { DebitCardStoreState } from './types';

export default {
  namespaced: true,
  state: {
    availableSkins: allSkins,
    cardInfo: undefined,
    cardState: 'order_now',
    currentSkin: defaultSkin,
    error: undefined,
    eventHistory: [],
    isLoading: false
  },
  actions,
  getters,
  mutations
} as Module<DebitCardStoreState, RootStoreState>;
