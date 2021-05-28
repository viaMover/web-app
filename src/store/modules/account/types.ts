import { NetworkInfo } from '@/utils/networkTypes';
import Web3 from 'web3';

export type Transaction = {
  blockNumber: string;
  hash: string;
  timeStamp: number;
  nonce: string;
  from: string;
  to: string;
  value: string;
};

export type TransactionGroup = {
  timeStamp: number;
  transactions: Array<Transaction>;
};

export type AccountData = {
  addresses: Array<string>;
  web3Inst: Web3 | undefined;
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
};

export type TokenWithBalance =
  | Token
  | {
      balance: string;
    };

export type AccountStoreState = {
  addresses: Array<string>;
  balance: undefined | string;
  networkInfo: undefined | NetworkInfo;
  currentAddress: undefined | string;
  transactions: Array<Transaction>;
  tokens: Array<TokenWithBalance>;
  allTokens: Array<Token>;
  web3: undefined | Web3;
  providerBeforeClose: () => void;
  refreshError: undefined | string;
};
