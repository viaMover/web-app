import Web3 from 'web3';

export type Transaction = {
  hash: string;
  timeStamp: number;
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

export type AccountStoreState = {
  addresses: Array<string>;
  balance: null | string;
  networkId: null | number;
  currentAddress: string | null;
  transactions: Array<Transaction>;
  web3: null | Web3;
  providerBeforeClose: () => void;
};
