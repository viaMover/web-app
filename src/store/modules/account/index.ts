import UAuthSPA from '@uauth/js';

import { isProduction } from '@/settings';
import {
  AccountStoreState,
  NativeCurrency,
  uauthOptions
} from '@/store/modules/account/types';
import { AugmentedModule } from '@/store/types';
import { availableNetworks } from '@/wallet/allTokens';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    web3Modal: undefined,
    uauthClient: new UAuthSPA(uauthOptions),
    unstoppableDomainsName: undefined,

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
    availableNetworks: availableNetworks,

    gasPrices: undefined,
    gasUpdating: false,
    gasUpdaterHandle: undefined,
    gasUpdaterCallers: [],
    nativeCurrency: NativeCurrency.USD,

    ethPrice: undefined,
    movePriceInWeth: undefined,
    usdcPriceInNative: undefined,
    slpPriceInWeth: undefined,
    eursPriceInWeth: undefined,

    //explorers
    explorer: undefined,
    offchainExplorerHanlder: undefined,

    //charts
    chartData: undefined,

    // eslint-disable-next-line
    providerBeforeClose: () => {
    },
    allTokens: [],
    allTokensSearcher: undefined,
    refreshError: undefined,

    isDebitCardSectionVisible: true,
    isDepositCardSectionVisible: true,
    isOrderOfLibertySectionVisible: true,
    swapAPIService: undefined,
    swapOnChainService: undefined,
    theGraphAPIService: undefined,
    coinGeckoAPIService: undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<AccountStoreState, ActionType, GetterType, MutationType>;
