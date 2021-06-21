import walletActions from './actions/wallet';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import gasActions from './actions/gas';
import chartsActions from './actions/charts';

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

    //explorer
    explorer: undefined,

    //charts
    chartData: undefined,

    // eslint-disable-next-line
    providerBeforeClose: () => {},
    allTokens: [],
    refreshError: undefined
  },
  actions: { ...walletActions, ...gasActions, ...chartsActions },
  getters,
  mutations
} as Module<AccountStoreState, RootStoreState>;
