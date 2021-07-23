export type Asset = {
  id: string;
  address: string;
  previewImageSrc: string;
  imageSrc: string;
  imageSize: string;
  imageScaleH: string;
  background: string;
  title: string;
  price: string;
  edition: string;
  totalTrades: number;
  initialQuantity: number;
  redeemedQuantity: number;
  remainingQuantity: number;
  availableQuantity: number;
  description: string;
  page: {
    iconSrc: string;
    videoSrc: string;
    title: string;
  };
};

export type ShopStoreState = {
  assets: Array<Asset>;
  isLoading: boolean;
  loadingPromise: Promise<Array<Asset>> | null;
};
