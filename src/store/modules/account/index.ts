import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';

import chartsActions from './actions/charts';
import gasActions from './actions/gas';
import savingsActions from './actions/savings';
import transactionActions from './actions/transactions';
import treasuryActions from './actions/treasury';
import utilityActions from './actions/utility';
import walletActions from './actions/wallet';
import savingsGetters from './getters/savings';
import transactionsGetters from './getters/transactions';
import treasuryGetters from './getters/treasury';
import walletGetters from './getters/wallet';
import savingsMutations from './mutations/savings';
import transactionMutations from './mutations/transactions';
import treasuryMutations from './mutations/treasury';
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

    powercardBalance: undefined,
    powercardState: undefined,
    powercardActiveTime: 0,
    powercardCooldownTime: 0,

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
    ...transactionActions,
    ...utilityActions,
    ...walletActions
  },
  getters: {
    ...savingsGetters,
    ...transactionsGetters,
    ...treasuryGetters,
    ...walletGetters
  },
  mutations: {
    ...savingsMutations,
    ...transactionMutations,
    ...treasuryMutations,
    ...utilityMutations,
    ...walletMutations
  }
} as Module<AccountStoreState, RootStoreState>;
