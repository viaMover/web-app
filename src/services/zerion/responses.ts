export type ZerionAsset = {
  asset_code: string;
  decimals: number;
  icon_url: string;
  is_displayable: boolean;
  is_verified: boolean;
  name: string;
  price: {
    changed_at: number;
    relative_change_24h: number;
    value: number;
  };
  symbol: string;
  type: string;
};

export type ZerionTransaction = {
  address_from: string;
  address_to: string;
  block_number: number;
  changes: Array<unknown>;
  contract: null;
  direction: 'in' | 'out';
  fee: {
    value: number;
    price: number;
  };
  hash: string;
  id: string;
  meta: {
    action?: string;
    amount?: number;
    spender?: string;
    asset?: ZerionAsset;
  };
  mined_at: number;
  nonce: number;
  protocol: null | string;
  status: string;
  type: string;
};

export type ZerionTransactionsReceived = {
  meta: {
    address: string;
    currency: string;
    status: string;
    transactions_limit: number;
    transactions_offset: number;
  };
  payload: {
    transactions: Array<ZerionTransaction>;
  };
};
