import { SavingsInfo, SavingsReceipt } from '@/services/mover';
import { Explorer } from '@/services/zerion/explorer';
import { NetworkInfo } from '@/utils/networkTypes';
import { Token, TokenWithBalance, Transaction, GasData } from '@/wallet/types';
import Web3 from 'web3';

export type ChartPair = [number, number];

export type TransactionGroup = {
  timeStamp: number;
  transactions: Array<Transaction>;
};

export type AccountData = {
  addresses: Array<string>;
  balance: string | undefined;
  networkId: number | undefined;
};

export type ProviderNames = 'MetaMask' | 'WalletConnect' | null;

export type ProviderData = {
  web3: Web3;
  providerName: ProviderNames;
  providerBeforeClose: () => void;
};

export type AccountStoreState = {
  addresses: Array<string>;
  balance: undefined | string;
  networkInfo: undefined | NetworkInfo;
  currentAddress: undefined | string;
  transactions: Array<Transaction>;
  tokens: Array<TokenWithBalance>;
  allTokens: Array<Token>;
  provider: ProviderData | undefined;
  detectedProvider: any | undefined;
  isDetecting: boolean;
  refreshError: undefined | string;

  nativeCurrency: 'usd';
  // main prices in native currency
  ethPrice: undefined | string;

  // explorer
  explorer: undefined | Explorer;
  //charts
  chartData: undefined | Record<string, ChartPair[]>;

  gasPrices: GasData | undefined;
  gasUpdating: boolean;
  isDebitCardSectionVisible: boolean;

  isSavingsInfoLoading: boolean;
  savingsInfo: SavingsInfo | undefined;
  savingsInfoError: string | undefined;

  isSavingsRecepitLoading: boolean;
  savingsReceipt: SavingsReceipt | undefined;
  savingsReceiptError: string | undefined;

  savingsAPY: string | undefined;
  savingsDPY: string | undefined;
};
