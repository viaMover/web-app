import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    addresses: [],
    currentAddress: null,
    transactions: [],
    tokens: [],
    web3: null,
    balance: null,
    networkId: null,
    // eslint-disable-next-line
    providerBeforeClose: () => {},
    allTokens: [],
    refreshError: null
  },
  actions,
  getters,
  mutations
} as Module<AccountStoreState, RootStoreState>;
