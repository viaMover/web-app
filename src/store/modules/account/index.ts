import { isProduction } from '@/settings';
import { AccountStoreState } from '@/store/modules/account/types';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';

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
    isTokensListLoaded: false,
    tokensSearcher: undefined,
    tokenInfoMap: undefined,
    provider: undefined,
    isDetecting: true,
    isWalletLoading: true,
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
  actions,
  getters,
  mutations
} as AugmentedModule<AccountStoreState, ActionType, GetterType, MutationType>;
