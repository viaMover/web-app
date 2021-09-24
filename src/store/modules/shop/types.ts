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
    description: string;
    videoSrc: string;
    background: string;
  };
};

export type ShopStoreState = {
  assets: Array<Asset>;
  isLoading: boolean;
  loadingPromise: Promise<Array<Asset>> | null;
};
