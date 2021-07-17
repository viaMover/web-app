export type ZerionAsset = {
  asset_code: string;
  decimals: number;
  icon_url: string;
  is_displayable: boolean;
  is_verified: boolean;
  name: string;
  price?: {
    changed_at: number;
    relative_change_24h: number;
    value: number;
  };
  symbol: string;
  type: string;
};

export type ZerionAssetWithBalance = {
  asset: ZerionAsset;
  quantity: string;
};

export type ZerionChange = {
  address_from: string;
  address_to: string;
  asset: {
    asset_code: string;
    name: string;
    symbol: string;
    decimals: number;
    icon_url: string;
    price: {
      value: number;
    };
  };
  direction: 'in' | 'out' | 'self';
  price: number;
  value: number;
};

export type ZerionTransaction = {
  address_from: string;
  address_to: string;
  block_number: number;
  contract: null;
  direction: 'in' | 'out';
  fee: {
    value: number;
    price: number;
  };
  hash: string;
  id: string;
  mined_at: number;
  nonce: number;
  protocol: null | string;
  status: string;
} & (
  | {
      type: 'trade';
      changes: ZerionChange[];
    }
  | {
      type: 'send';
      changes: ZerionChange[];
    }
  | {
      type: 'authorize';
      meta: {
        action: string;
        asset: {
          asset_code: string;
          decimals: number;
          icon_url: string;
          name: string;
          symbol: string;
        };
      };
    }
  | {
      type: 'receive';
      changes: ZerionChange[];
    }
  | {
      type: 'execution';
    }
);

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

export type ZerionAssetsReceived = {
  meta: {
    address: string;
    currency: string;
    status: string;
  };
  payload: {
    assets: Map<string, ZerionAssetWithBalance>;
  };
};

export type ZerionChartsReceived = {
  meta: {
    charts_type: string;
    currency: string;
    status: string;
    asset_codes: string[];
  };
  payload: {
    charts: Record<string, Array<[number, number]>>;
  };
};
