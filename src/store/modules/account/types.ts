export type Transaction = {
  hash: string;
  timeStamp: number;
};

export type TransactionGroup = {
  timeStamp: number;
  transactions: Array<Transaction>;
};

export type AccountStoreState = {
  addresses: Array<string>;
  currentAddress: string | null;
  transactions: Array<Transaction>;
};
