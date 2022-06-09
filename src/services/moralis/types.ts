import {
  Erc20Transaction,
  NativeTransaction
} from '@/services/moralis/responses';

export enum NetworkAlias {
  Eth = 'eth',
  Ropsten = 'ropsten',
  Rinkeby = 'rinkeby',
  Goerli = 'goerli',
  Koven = 'kovan',
  Polygon = 'polygon',
  Mumbai = 'mumbai',
  Bsc = 'bsc',
  BscTestnet = 'bsc testnet',
  Avalanche = 'avalanche',
  Fantom = 'fantom'
}

export type TransactionsResponse<
  T extends Array<NativeTransaction> | Array<Erc20Transaction>
> = {
  transactions: T;
  hasMore: boolean;
};
