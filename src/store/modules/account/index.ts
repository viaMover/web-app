import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';

import chartsActions from './actions/charts';
import gasActions from './actions/gas';
import transactionActions from './actions/transactions';
import treasuryActions from './actions/treasury';
import utilityActions from './actions/utility';
import walletActions from './actions/wallet';
import transactionsGetters from './getters/transactions';
import treasuryGetters from './getters/treasury';
import walletGetters from './getters/wallet';
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
    ...treasuryActions,
    ...transactionActions,
    ...utilityActions,
    ...walletActions
  },
  getters: {
    ...transactionsGetters,
    ...treasuryGetters,
    ...walletGetters
  },
  mutations: {
    ...transactionMutations,
    ...treasuryMutations,
    ...utilityMutations,
    ...walletMutations
  }
} as Module<AccountStoreState, RootStoreState>;
