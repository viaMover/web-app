import walletActions from './actions/wallet';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import gasActions from './actions/gas';
import chartsActions from './actions/charts';
import utilityActions from './actions/utility';
import savingsActions from './actions/savings';

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
    movePriceInWeth: undefined,
    usdcPriceInWeth: undefined,

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

    isSavingsReceiptLoading: false,
    savingsReceipt: undefined,
    savingsReceiptError: undefined,

    savingsAPY: undefined,
    savingsDPY: undefined
  },
  actions: {
    ...walletActions,
    ...gasActions,
    ...chartsActions,
    ...utilityActions,
    ...savingsActions
  },
  getters,
  mutations
} as Module<AccountStoreState, RootStoreState>;
