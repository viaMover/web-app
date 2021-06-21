export type SmallToken = SmallTokenInfo | Token | TokenWithBalance;

export type SmallTokenInfo = {
  address: string;
  decimals: number;
  symbol: string;
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

export type GasData = {
  LastBlock: string;
  SafeGas: {
    price: string;
    estTime: number;
  };
  ProposeGas: {
    price: string;
    estTime: number;
  };
  FastGas: {
    price: string;
    estTime: number;
  };
};

export type TransactionsParams = {
  from: string;
  gas?: number;
  gasPrice?: string;
  value?: string;
};
