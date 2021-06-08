import { NetworkInfo } from '@/utils/networkTypes';
import Web3 from 'web3';

export enum TransactionTypes {
  sendERC20 = 'sendERC20',
  receiveERC20 = 'receiveERC20',
  sendEth = 'sendEth',
  receiveEth = 'receiveEth'
}

export type Transaction = {
  blockNumber: string;
  hash: string;
  timeStamp: number;
  nonce: string;
  from: string;
  to: string;
  value: string;
  type: TransactionTypes;
  symbol?: string;
};

export type TransactionGroup = {
  timeStamp: number;
  transactions: Array<Transaction>;
};

export type AccountData = {
  addresses: Array<string>;
  balance: string | undefined;
  networkId: number | undefined;
};

export type Token = {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  priceUSD: string;
  logo: string;
  isFavorite: boolean;
  isVerified: boolean;
};

export type TokenWithBalance = Token & {
  balance: string;
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
};
