import { SortAndDedupedTransactions } from './utils/transactions';
import { getNetworkByChainId } from '@/utils/networkTypes';
import { MutationTree } from 'vuex';
import {
  AccountStoreState,
  AccountData,
  ProviderData,
  ChartPair
} from './types';
import { Transaction, Token, TokenWithBalance, GasData } from '@/wallet/types';
import { SortAndDedupedTokens } from './utils/tokens';
import { Explorer } from '@/services/zerion/explorer';
import { SavingsInfo, SavingsReceipt } from '@/services/mover/savings';

export default {
  setEthPrice(state, ethPrice: string): void {
    state.ethPrice = ethPrice;
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
    const orderedDedupedResults = SortAndDedupedTokens(tokens);
    state.tokens = orderedDedupedResults;
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
      providerBeforeClose: payload.providerBeforeClose
    } as ProviderData;
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
    state.isSavingsRecepitLoading = isLoading;
  },
  setSavingsReceiptError(state, error: string | undefined): void {
    state.savingsReceiptError = error;
  },
  setSavingsReceipt(state, receipt: SavingsReceipt): void {
    state.savingsReceipt = receipt;
  },
  setSavingsAPY(state, apy: string): void {
    state.savingsAPY = apy;
  },
  setSavingsDPY(state, dpy: string): void {
    state.savingsDPY = dpy;
  }
} as MutationTree<AccountStoreState>;
