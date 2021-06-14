import walletActions from './actions/wallet';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import { getTokenLogo } from '@/services/trustwallet/logo';
import gas from './actions/gas';
import { Token } from '@/wallet/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    addresses: [],
    currentAddress: undefined,
    transactions: [],
    tokens: [],
    provider: undefined,
    detectedProvider: undefined,
    isDetecting: false,
    balance: undefined,
    networkInfo: undefined,

    gasPrices: undefined,
    gasUpdating: false,

    // eslint-disable-next-line
    providerBeforeClose: () => {},
    allTokens: [],
    refreshError: undefined
  },
  actions: { ...walletActions, ...gas },
  getters,
  mutations
} as Module<AccountStoreState, RootStoreState>;
