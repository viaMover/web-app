import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';

import chartsActions from './actions/charts';
import gasActions from './actions/gas';
import transactionActions from './actions/transactions';
import utilityActions from './actions/utility';
import walletActions from './actions/wallet';
import transactionsGetters from './getters/transactions';
import walletGetters from './getters/wallet';
import transactionMutations from './mutations/transactions';
import utilityMutations from './mutations/utility';
import walletMutations from './mutations/wallet';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    web3Modal: undefined,

    avatar: undefined,
    avatars: [],
    addresses: [],
    currentAddress: undefined,
    isTransactionsListLoaded: false,
    transactions: [],
    tokens: [],
    tokensSearcher: undefined,
    tokenInfoMap: undefined,
    provider: undefined,
    isDetecting: false,
    isWalletLoading: false,
    balance: undefined,
    networkInfo: undefined,

    gasPrices: undefined,
    gasUpdating: false,
    gasUpdaterHandle: undefined,
    gasUpdaterCallers: [],

    nativeCurrency: 'usd',

    ethPrice: undefined,
    movePriceInWeth: undefined,
    usdcPriceInWeth: undefined,
    slpPriceInWeth: undefined,
    eursPriceInWeth: undefined,

    //explorers
    explorer: undefined,
    offchainExplorerHanlder: undefined,

    //charts
    chartData: undefined,

    // eslint-disable-next-line
    providerBeforeClose: () => {},
    allTokens: [],
    allTokensSearcher: undefined,
    refreshError: undefined,

    isDebitCardSectionVisible: true,
    isDepositCardSectionVisible: true
  },
  actions: {
    ...chartsActions,
    ...gasActions,
    ...transactionActions,
    ...utilityActions,
    ...walletActions
  },
  getters: {
    ...transactionsGetters,
    ...walletGetters
  },
  mutations: {
    ...transactionMutations,
    ...utilityMutations,
    ...walletMutations
  }
} as Module<AccountStoreState, RootStoreState>;
