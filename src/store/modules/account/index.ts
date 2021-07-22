import walletActions from './actions/wallet';
import { Module } from 'vuex';
import { AccountStoreState, Avatar } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import gasActions from './actions/gas';
import chartsActions from './actions/charts';
import utilityActions from './actions/utility';
import savingsActions from './actions/savings';
import walletMutations from './mutations/wallet';
import treasuryMutations from './mutations/treasury';
import walletGetters from './getters/wallet';
import treasuryGetters from './getters/treasury';

import allAvatars from '@/../data/avatars.json';

export default {
  namespaced: true,
  strict: true,
  state: {
    avatar: undefined,
    avatars: allAvatars as Array<Avatar>,
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
    savingsDPY: undefined,

    treasuryBalanceMove: undefined,
    treasuryBalanceLP: undefined,
    treasuryBonus: undefined,
    treasuryAPY: undefined,
    treasuryTotalStakedMove: undefined,
    treasuryTotalStakedMoveEthLP: undefined
  },
  actions: {
    ...walletActions,
    ...gasActions,
    ...chartsActions,
    ...utilityActions,
    ...savingsActions
  },
  getters: {
    ...walletGetters,
    ...treasuryGetters
  },
  mutations: {
    ...walletMutations,
    ...treasuryMutations
  }
} as Module<AccountStoreState, RootStoreState>;
