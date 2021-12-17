export type Asset = {
  active: boolean;
  id: string;
  urlId: string;
  intId: string;
  address: string;
  feeAmount: string;
  balance: number;
  initialQuantity: number;
  totalClaimed: number;
  redeemCount: number;
  title: string;
  shortName: string;
  preview: {
    videoSrc: string;
    background: string;
  };
  page: {
    videoSrc: string;
    background: string;
  };
};

export type TokenDate = {
  tokenId: string;
  tokenIntId: string;
  balance: number;
  initialQuantity?: number;
  totalClaimed: number;
  redeemCount: number;
};

export type SetAssetData = {
  assetId: string;
  asset: TokenDate;
};

export type Country = {
  name: string;
  code: string;
};

export type ShopStoreState = {
  localAssets: Array<Asset>;
  assets: Array<Asset>;
  isLoading: boolean;
  countries: Array<Country>;
};

export type RedeemParams = {
  tokenIntId: string;
  tokenUrl: string;
  email: string;
  name: string;
  country: string;
  address: string;
  postalCode: string;
};
