import { Module } from 'vuex';

import { AccountStoreState, Avatar } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';

import chartsActions from './actions/charts';
import gasActions from './actions/gas';
import savingsActions from './actions/savings';
import treasuryActions from './actions/treasury';
import utilityActions from './actions/utility';
import walletActions from './actions/wallet';

import savingsGetters from './getters/savings';
import treasuryGetters from './getters/treasury';
import walletGetters from './getters/wallet';

import savingsMutations from './mutations/savings';
import treasuryMutations from './mutations/treasury';
import utilityMutations from './mutations/utility';
import walletMutations from './mutations/wallet';

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
    tokensSearcher: undefined,
    tokenColorMap: undefined,
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
    slpPriceInWeth: undefined,

    //explorer
    explorer: undefined,

    //charts
    chartData: undefined,

    // eslint-disable-next-line
    providerBeforeClose: () => {},
    allTokens: [],
    allTokensSearcher: undefined,
    refreshError: undefined,

    isDebitCardSectionVisible: true,
    isDepositCardSectionVisible: true,

    isSavingsInfoLoading: false,
    savingsInfo: undefined,
    savingsInfoError: undefined,

    isSavingsReceiptLoading: false,
    savingsReceipt: undefined,
    savingsReceiptError: undefined,

    savingsBalance: undefined,
    savingsAPY: undefined,
    savingsDPY: undefined,

    treasuryBalanceMove: undefined,
    treasuryBalanceLP: undefined,
    treasuryBonus: undefined,
    treasuryAPY: undefined,
    treasuryTotalStakedMove: undefined,
    treasuryTotalStakedMoveEthLP: undefined,

    isTreasuryInfoLoading: false,
    treasuryInfo: undefined,
    treasuryInfoError: undefined,

    isTreasuryReceiptLoading: false,
    treasuryReceipt: undefined,
    treasuryReceiptError: undefined
  },
  actions: {
    ...chartsActions,
    ...gasActions,
    ...savingsActions,
    ...treasuryActions,
    ...utilityActions,
    ...walletActions
  },
  getters: {
    ...savingsGetters,
    ...treasuryGetters,
    ...walletGetters
  },
  mutations: {
    ...savingsMutations,
    ...treasuryMutations,
    ...utilityMutations,
    ...walletMutations
  }
} as Module<AccountStoreState, RootStoreState>;
