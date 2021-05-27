export type Asset = {
  id: string;
  address: string;
  imageSrc: string;
  title: string;
  price: string;
  edition: string;
  totalTrades: number;
  initialQuantity: number;
  redeemedQuantity: number;
  remainingQuantity: number;
  availableQuantity: number;
  description: string;
};

export type ShopStoreState = {
  assets: Array<Asset>;
  isLoading: boolean;
  loadingPromise: Promise<Array<Asset>> | null;
};
