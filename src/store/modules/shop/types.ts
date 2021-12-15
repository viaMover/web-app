export type Asset = {
  id: string;
  address: string;
  price: string;
  totalTrades: number;
  initialQuantity: number;
  redeemedQuantity: number;
  remainingQuantity: number;
  availableQuantity: number;
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
  totalClaimed: number;
  balance: number;
  totalSupplyCap: number;
};

export type SetAssetData = {
  assetId: string;
  asset: TokenDate;
};

export type ShopStoreState = {
  localAssets: Array<Asset>;
  assets: Array<Asset>;
  isLoading: boolean;
};
