export type APIPriceRecord = {
  [addressOrId: string]: {
    [currency: string]: number;
  };
};

export type PriceRecord = {
  [addressOrId: string]: {
    [currency: string]: string;
  };
};

export type BaseAssetPriceRecord = {
  [currency: string]: string;
};

export type GetPriceOptions = {
  include_market_cap?: boolean;
  include_24hr_vol?: boolean;
  include_24hr_change?: boolean;
  include_last_updated_at?: boolean;
};

export type Currency =
  | 'btc'
  | 'eth'
  | 'ltc'
  | 'bch'
  | 'bnb'
  | 'eos'
  | 'xrp'
  | 'xlm'
  | 'link'
  | 'dot'
  | 'yfi'
  | 'usd'
  | 'aed'
  | 'ars'
  | 'aud'
  | 'bdt'
  | 'bhd'
  | 'bmd'
  | 'brl'
  | 'cad'
  | 'chf'
  | 'clp'
  | 'cny'
  | 'czk'
  | 'dkk'
  | 'eur'
  | 'gbp'
  | 'hkd'
  | 'huf'
  | 'idr'
  | 'ils'
  | 'inr'
  | 'jpy'
  | 'krw'
  | 'kwd'
  | 'lkr'
  | 'mmk'
  | 'mxn'
  | 'myr'
  | 'ngn'
  | 'nok'
  | 'nzd'
  | 'php'
  | 'pkr'
  | 'pln'
  | 'rub'
  | 'sar'
  | 'sek'
  | 'sgd'
  | 'thb'
  | 'try'
  | 'twd'
  | 'uah'
  | 'vef'
  | 'vnd'
  | 'zar'
  | 'xdr'
  | 'xag'
  | 'xau'
  | 'bits'
  | 'sats';
