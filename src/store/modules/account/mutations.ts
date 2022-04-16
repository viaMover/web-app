import Vue from 'vue';

import Fuse from 'fuse.js';

import { Explorer } from '@/services/explorer';
import { ZeroXAPIService } from '@/services/v2/api/0x';
import { CoinGeckoAPIService } from '@/services/v2/api/coinGecko';
import { TheGraphAPIService } from '@/services/v2/api/theGraph';
import { SwapOnChainService } from '@/services/v2/on-chain/mover/swap';
import {
  AccountData,
  AccountStoreState,
  Avatar,
  ChartPair,
  NativeCurrency,
  ProviderData
} from '@/store/modules/account/types';
import { sortAndDeduplicateTokens } from '@/store/modules/account/utils/tokens';
import { sortAndDeduplicateTransactions } from '@/store/modules/account/utils/transactions';
import { MutationFuncs } from '@/store/types';
import { sameAddress } from '@/utils/address';
import { getNetworkByChainId, Network } from '@/utils/networkTypes';
import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';
import { GasData, Token, TokenWithBalance, Transaction } from '@/wallet/types';

import assetListEthereum from '@/../../data/assets/assetList-ethereum.json';
type Mutations = {
  addTransaction: void;
  setIsTransactionsListLoaded: void;
  setWalletTransactions: void;
  updateWalletTransactions: void;
  removeWalletTransaction: void;
  toggleIsDebitCardSectionVisible: void;
  toggleIsDepositCardSectionVisible: void;
  toggleIsOrderOfLibertySectionVisible: void;
  setBaseTokenPrices: void;
  setMovePriceInWeth: void;
  setUsdcPriceInWeth: void;
  setSLPPriceInWETH: void;
  setEursPriceInWeth: void;
  setExplorer: void;
  setOffchainExplorerHandler: void;
  setChartData: void;
  setCurrentWallet: void;
  setWalletTokens: void;
  updateWalletTokens: void;
  removeWalletTokens: void;
  setAllTokens: void;
  setRefreshError: void;
  setIsDetecting: void;
  setProvider: void;
  setAccountData: void;
  clearWalletData: void;
  setGasPrices: void;
  setGasUpdating: void;
  setGasUpdaterHandle: void;
  clearGasUpdaterHandle: void;
  pushGasListenerCaller: void;
  popGasListenerCaller: void;
  setAvatars: void;
  setAvatar: void;
  setWeb3Modal: void;
  setIsTokensListLoaded: void;
  setSwapAPIService: void;
  setSwapOnChainService: void;
  setTokenNativePrice: void;
  setNativeCurrency: void;
  setCoinGeckoAPIService: void;
  setTheGraphAPIService: void;
};

const mutations: MutationFuncs<Mutations, AccountStoreState> = {
  addTransaction(state, newTransaction: Transaction): void {
    state.transactions = sortAndDeduplicateTransactions([
      newTransaction,
      ...state.transactions
    ]);
  },
  setIsTransactionsListLoaded(state, val: boolean): void {
    state.isTransactionsListLoaded = val;
  },
  setWalletTransactions(state, transactions: Array<Transaction>): void {
    state.transactions = sortAndDeduplicateTransactions(transactions);
  },
  updateWalletTransactions(state, newTransactions: Array<Transaction>): void {
    const allTransactions = [...newTransactions, ...state.transactions];
    state.transactions = sortAndDeduplicateTransactions(allTransactions);
  },
  removeWalletTransaction(state, removeHashes: Array<string>): void {
    state.transactions = state.transactions.filter(
      (t: Transaction) => !removeHashes.includes(t.hash)
    );
  },
  toggleIsDebitCardSectionVisible(state): void {
    state.isDebitCardSectionVisible = !state.isDebitCardSectionVisible;
  },
  toggleIsDepositCardSectionVisible(state): void {
    state.isDepositCardSectionVisible = !state.isDepositCardSectionVisible;
  },
  setBaseTokenPrices(state, baseTokensPrices: Map<Network, string>): void {
    state.baseTokensPrices = baseTokensPrices;
  },
  setMovePriceInWeth(state, movePriceInWeth: string): void {
    state.movePriceInWeth = movePriceInWeth;
  },
  setUsdcPriceInWeth(state, usdcPriceInWeth: string): void {
    state.usdcPriceInWeth = usdcPriceInWeth;
  },
  setSLPPriceInWETH(state, slpPriceInWeth: string): void {
    state.slpPriceInWeth = slpPriceInWeth;
  },
  setEursPriceInWeth(state, eursPriceInWETH: string): void {
    state.eursPriceInWeth = eursPriceInWETH;
  },
  setExplorer(state, explorer: Explorer): void {
    state.explorer = explorer;
  },
  setOffchainExplorerHandler(
    state,
    oeh: OffchainExplorerHanler | undefined
  ): void {
    state.offchainExplorerHanlder = oeh;
  },
  setChartData(state, chartData: Record<string, ChartPair[]>): void {
    state.chartData = chartData;
  },
  setCurrentWallet(state, address): void {
    state.currentAddress = address;
  },
  setWalletTokens(state, tokens: Array<TokenWithBalance>): void {
    state.tokens = sortAndDeduplicateTokens(tokens);
  },
  updateWalletTokens(state, newTokens: Array<TokenWithBalance>): void {
    const allTokens = [...newTokens, ...state.tokens];
    state.tokens = sortAndDeduplicateTokens(allTokens);
  },
  removeWalletTokens(state, removeHashes: Array<string>): void {
    state.tokens = state.tokens.filter(
      (t: TokenWithBalance) => !removeHashes.includes(t.address)
    );
  },
  setAllTokens(state, tokens: Map<Network, Array<Token>>): void {
    const searchOptions = {
      keys: [
        {
          name: 'name',
          weight: 1
        },
        {
          name: 'symbol',
          weight: 2.5
        }
      ],
      findAllMatches: true,
      threshold: 0,
      shouldSort: true
    };

    tokens.forEach((tokens, network) => {
      state.allTokens[network] = tokens;
      const aggregateObject: Record<string, Token> = {};
      for (let i = 0; i < tokens.length; i++) {
        aggregateObject[tokens[i].address.toLowerCase()] = tokens[i];
      }
      state.tokenInfoMap[network] = aggregateObject;

      // We should use plain arrays for Fuse
      const index = Fuse.createIndex(searchOptions.keys, Array.from(tokens));
      state.allTokensSearcher[network] = new Fuse(
        Array.from(tokens),
        searchOptions,
        index
      );
    });
  },
  setRefreshError(state, error): void {
    state.refreshError = error;
  },
  setIsDetecting(state, isDetecting: boolean): void {
    state.isDetecting = isDetecting;
  },
  setProvider(state, payload: ProviderData): void {
    state.provider = {
      web3: payload.web3,
      providerBeforeClose: payload.providerBeforeClose,
      pureProvider: payload.pureProvider
    };
  },
  setAccountData(state, ad: AccountData): void {
    state.addresses = ad.addresses;
    if (ad.addresses) {
      state.currentAddress = ad.addresses[0];
    }
    state.balance = ad.balance;
    if (ad.networkId !== undefined) {
      state.networkInfo = getNetworkByChainId(ad.networkId);
    } else {
      state.networkInfo = undefined;
    }
  },
  clearWalletData(state): void {
    state.provider = undefined;
    state.addresses = [];
    state.balance = undefined;
    state.currentAddress = undefined;
    state.networkInfo = undefined;
    state.refreshError = undefined;
    state.tokens = [];
    state.transactions = [];
  },
  setGasPrices(state, gasPrices: GasData): void {
    state.gasPrices = gasPrices;
  },
  setGasUpdating(state, val: boolean): void {
    state.gasUpdating = val;
  },
  setGasUpdaterHandle(state, handle: number): void {
    state.gasUpdaterHandle = handle;
  },
  clearGasUpdaterHandle(state): void {
    window.clearTimeout(state.gasUpdaterHandle);
    state.gasUpdaterHandle = undefined;
  },
  pushGasListenerCaller(state, caller: string): void {
    state.gasUpdaterCallers = state.gasUpdaterCallers.concat(caller);
  },
  popGasListenerCaller(state, caller: string): void {
    const idx = state.gasUpdaterCallers.lastIndexOf(caller);
    if (idx < 0) {
      return;
    }

    const newGasUpdaterCallers = [...state.gasUpdaterCallers];
    newGasUpdaterCallers.splice(idx, 1);
    state.gasUpdaterCallers = newGasUpdaterCallers;
  },
  setAvatars(state, avatars: Array<Avatar>): void {
    state.avatars = avatars;
  },
  setAvatar(state, avatar: Avatar): void {
    state.avatar = avatar;
  },
  setWeb3Modal(state, web3Modal: any): void {
    state.web3Modal = web3Modal;
  },
  setIsTokensListLoaded(state, isLoaded: boolean): void {
    state.isTokensListLoaded = isLoaded;
  },
  toggleIsOrderOfLibertySectionVisible(state): void {
    state.isOrderOfLibertySectionVisible =
      !state.isOrderOfLibertySectionVisible;
  },
  setSwapAPIService(state, service: ZeroXAPIService): void {
    state.swapAPIService = service;
  },
  setSwapOnChainService(state, service: SwapOnChainService): void {
    state.swapOnChainService = service;
  },
  setTokenNativePrice(
    state,
    { address, nativePrice }: { address: string; nativePrice: string }
  ): void {
    const tokensIdx = state.tokens.findIndex((t) =>
      sameAddress(t.address, address)
    );
    const allTokensIdx = state.tokens.findIndex((t) =>
      sameAddress(t.address, address)
    );

    if (tokensIdx > -1) {
      Vue.set(state.tokens, tokensIdx, {
        ...state.tokens[tokensIdx],
        priceUSD: nativePrice
      });
    }

    if (allTokensIdx > -1) {
      Vue.set(state.tokens, allTokensIdx, {
        ...state.tokens[allTokensIdx],
        priceUSD: nativePrice
      });
    }
  },
  setNativeCurrency(state, nativeCurrency: NativeCurrency): void {
    state.nativeCurrency = nativeCurrency;
  },
  setCoinGeckoAPIService(state, service: CoinGeckoAPIService): void {
    state.coinGeckoAPIService = service;
  },
  setTheGraphAPIService(state, service: TheGraphAPIService): void {
    state.theGraphAPIService = service;
  }
};

export type MutationType = typeof mutations;
export default mutations;
