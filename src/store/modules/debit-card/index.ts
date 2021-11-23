import { Module } from 'vuex';

import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { DebitCardStoreState } from './types';

export default {
  namespaced: true,
  state: {
    availableSkins: undefined,
    cardInfo: undefined,
    cardState: 'order_now',
    currentSkin: undefined,
    error: undefined,
    eventHistory: [],
    isLoading: false,
    loadingPromise: undefined,
    isInitialized: false,
    email: undefined,
    emailHash: undefined,
    emailSignature: undefined,
    orderState: undefined,
    phoneNumber: undefined,
    kycLink: undefined
  },
  actions,
  getters,
  mutations
} as Module<DebitCardStoreState, RootStoreState>;
