export type NativeBalanceResponse = {
  balance: string;
};

export type Erc20TokensResponse = {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: string;
  balance: string;
};

export type Erc20TokenMetadata = {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
  logo: string | null;
  logo_hash: string | null;
  thumbnail: string | null;
  block_number: string;
  validated: number;
};

export type Erc20TransactionResponse = {
  total: number;
  page: number;
  page_size: number;
  result: Array<Erc20Transaction>;
  cursor: string | null;
};

export type Erc20Transaction = {
  transaction_hash: string;
  address: string;
  block_timestamp: string;
  block_number: string;
  block_hash: string;
  to_address: string;
  from_address: string;
  value: string;
};

export type NativeTransactionResponse = {
  total: number;
  page: number;
  page_size: number;
  result: Array<NativeTransaction>;
  cursor: string | null;
};

export type NativeTransaction = {
  hash: string;
  nonce: string;
  transaction_index: string;
  from_address: string;
  to_address: string;
  value: string;
  gas: string;
  gas_price: string;
  input: string;
  receipt_cumulative_gas_used: string;
  receipt_gas_used: string;
  receipt_status: string;
  block_timestamp: string;
  block_number: string;
  block_hash: string;
};
