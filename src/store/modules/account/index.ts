import { isProduction } from '@/settings';
import {
  AccountStoreState,
  NativeCurrency
} from '@/store/modules/account/types';
import { AugmentedModule } from '@/store/types';
import { Network } from '@/utils/networkTypes';
import { availableNetworks } from '@/wallet/allTokens';

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
    tokenInfoMap: {
      [Network.mainnet]: undefined,
      [Network.arbitrum]: undefined,
      [Network.avalanche]: undefined,
      [Network.binance]: undefined,
      [Network.binanceTest]: undefined,
      [Network.celo]: undefined,
      [Network.fantom]: undefined,
      [Network.kovan]: undefined,
      [Network.optimism]: undefined,
      [Network.polygon]: undefined,
      [Network.rinkeby]: undefined,
      [Network.ropsten]: undefined
    },
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

    baseTokensPrices: undefined,

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
    allTokens: {
      [Network.mainnet]: [],
      [Network.arbitrum]: [],
      [Network.avalanche]: [],
      [Network.binance]: [],
      [Network.binanceTest]: [],
      [Network.celo]: [],
      [Network.fantom]: [],
      [Network.kovan]: [],
      [Network.optimism]: [],
      [Network.polygon]: [],
      [Network.rinkeby]: [],
      [Network.ropsten]: []
    },
    allTokensSearcher: {
      [Network.mainnet]: undefined,
      [Network.arbitrum]: undefined,
      [Network.avalanche]: undefined,
      [Network.binance]: undefined,
      [Network.binanceTest]: undefined,
      [Network.celo]: undefined,
      [Network.fantom]: undefined,
      [Network.kovan]: undefined,
      [Network.optimism]: undefined,
      [Network.polygon]: undefined,
      [Network.rinkeby]: undefined,
      [Network.ropsten]: undefined
    },
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
