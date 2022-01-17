import { MutationTree } from 'vuex';

import Fuse from 'fuse.js';

import { Explorer } from '@/services/explorer';
import { getNetworkByChainId } from '@/utils/networkTypes';
import { OffchainExplorerHanler } from '@/wallet/offchainExplorer';
import { GasData, Token, TokenWithBalance } from '@/wallet/types';

import {
  AccountData,
  AccountStoreState,
  Avatar,
  ChartPair,
  ProviderData
} from '../types';
import { sortAndDeduplicateTokens } from '../utils/tokens';

export default {
  setEthPrice(state, ethPrice: string): void {
    state.ethPrice = ethPrice;
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
    state.tokensSearcher = undefined;
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
  setAllTokens(state, tokens: Array<Token>): void {
    state.allTokens = tokens;
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
    const index = Fuse.createIndex(searchOptions.keys, state.allTokens);

    state.allTokensSearcher = new Fuse(state.allTokens, searchOptions, index);
    state.tokenInfoMap = state.allTokens.reduce((acc, token) => {
      if (token.color === undefined) {
        return acc;
      }

      return {
        ...acc,
        [token.address.toLowerCase()]: token
      };
    }, {});
  },
  setRefreshEror(state, error): void {
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
  }
} as MutationTree<AccountStoreState>;
