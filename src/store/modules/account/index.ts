import walletActions from './actions/wallet';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import gasActions from './actions/gas';
import chartsActions from './actions/charts';
import utilityActions from './actions/utility';

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

    nativeCurrency: 'usd',

    ethPrice: undefined,

    //explorer
    explorer: undefined,

    //charts
    chartData: undefined,

    // eslint-disable-next-line
    providerBeforeClose: () => {},
    allTokens: [],
    refreshError: undefined,

    isDebitCardSectionVisible: true,

    isSavingsInfoLoading: false,
    savingsInfo: undefined,
    savingsInfoError: undefined,

    isSavingsRecepitLoading: false,
    savingsReceipt: undefined,
    savingsReceiptError: undefined
  },
  actions: {
    ...walletActions,
    ...gasActions,
    ...chartsActions,
    ...utilityActions
  },
  getters,
  mutations
} as Module<AccountStoreState, RootStoreState>;
