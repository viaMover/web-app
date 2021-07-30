import { SortAndDedupedTransactions } from '../utils/transactions';
import { getNetworkByChainId } from '@/utils/networkTypes';
import { MutationTree } from 'vuex';
import {
  AccountData,
  AccountStoreState,
  Avatar,
  ChartPair,
  ProviderData
} from '../types';
import { GasData, Token, TokenWithBalance, Transaction } from '@/wallet/types';
import { SortAndDedupedTokens } from '../utils/tokens';
import { Explorer } from '@/services/zerion/explorer';
import { SavingsInfo, SavingsReceipt } from '@/services/mover';
import Fuse from 'fuse.js';

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
  setExplorer(state, explorer: Explorer): void {
    state.explorer = explorer;
  },
  setChartData(state, chartData: Record<string, ChartPair[]>): void {
    state.chartData = chartData;
  },
  setCurrentWallet(state, address): void {
    state.currentAddress = address;
  },
  setWalletTokens(state, tokens: Array<TokenWithBalance>): void {
    state.tokens = SortAndDedupedTokens(tokens);

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
      ]
    };
    state.tokensSearcher = new Fuse(state.tokens, searchOptions);
  },
  updateWalletTokens(state, newTokens: Array<TokenWithBalance>): void {
    const allTokens = [...newTokens, ...state.tokens];
    const orderedDedupedResults = SortAndDedupedTokens(allTokens);
    state.tokens = orderedDedupedResults;
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
      ]
    };
    const index = Fuse.createIndex(searchOptions.keys, state.allTokens);

    state.allTokensSearcher = new Fuse(state.allTokens, searchOptions, index);
    state.tokenColorMap = state.allTokens.reduce((acc, token) => {
      if (token.color === undefined) {
        return acc;
      }

      return {
        ...acc,
        [token.address.toLowerCase()]: token.color
      };
    }, {});
  },
  setWalletTransactions(state, transactions: Array<Transaction>): void {
    const orderedDedupedResults = SortAndDedupedTransactions(transactions);
    state.transactions = orderedDedupedResults;
  },
  updateWalletTransactions(state, newTransactions: Array<Transaction>): void {
    const allTransactions = [...newTransactions, ...state.transactions];
    const orderedDedupedResults = SortAndDedupedTransactions(allTransactions);
    state.transactions = orderedDedupedResults;
  },
  removeWalletTransaction(state, removeHashes: Array<string>): void {
    state.transactions = state.transactions.filter(
      (t: Transaction) => !removeHashes.includes(t.hash)
    );
  },
  setRefreshEror(state, error): void {
    state.refreshError = error;
  },
  setDetectedProvider(state, provider: any): void {
    state.detectedProvider = provider;
  },
  setIsDetecting(state, isDetecting: boolean): void {
    state.isDetecting = isDetecting;
  },
  setProvider(state, payload: ProviderData): void {
    state.provider = {
      providerName: payload.providerName,
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
  toggleIsDebitCardSectionVisible(state): void {
    state.isDebitCardSectionVisible = !state.isDebitCardSectionVisible;
  },
  setIsSavingsInfoLoading(state, isLoading: boolean): void {
    state.isSavingsInfoLoading = isLoading;
  },
  setSavingsInfoError(state, error: string | undefined): void {
    state.savingsInfoError = error;
  },
  setSavingsInfo(state, info: SavingsInfo | undefined): void {
    state.savingsInfo = info;
  },
  setIsSavingsReceiptLoading(state, isLoading: boolean): void {
    state.isSavingsReceiptLoading = isLoading;
  },
  setSavingsReceiptError(state, error: string | undefined): void {
    state.savingsReceiptError = error;
  },
  setSavingsReceipt(state, receipt: SavingsReceipt): void {
    state.savingsReceipt = receipt;
  },
  setAvatar(state, avatar: Avatar): void {
    state.avatar = avatar;
  }
} as MutationTree<AccountStoreState>;
