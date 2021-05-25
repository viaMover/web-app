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
  web3Inst: Web3 | null;
  balance: string | null;
  networkId: number | null;
};

export type Token = {
  symbol: string;
  name: string;
  balance: string;
};

export type AccountStoreState = {
  addresses: Array<string>;
  balance: null | string;
  networkId: null | number;
  currentAddress: string | null;
  transactions: Array<Transaction>;
  tokens: Array<Token>;
  allTokens: Array<Token>;
  web3: null | Web3;
  providerBeforeClose: () => void;
  refreshError: string | null;
};
