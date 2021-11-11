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
    cardState: 'request_email',
    currentSkin: undefined,
    error: undefined,
    eventHistory: [],
    isLoading: false,
    loadingPromise: undefined,
    email: undefined,
    emailHash: undefined,
    emailSignature: undefined,
    orderState: undefined,
    phoneNumber: undefined
  },
  actions,
  getters,
  mutations
} as Module<DebitCardStoreState, RootStoreState>;
