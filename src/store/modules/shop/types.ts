export type Asset = {
  address: string;
  imageSrc: string;
  title: string;
  price: string;
};

export type ShopStoreState = {
  assets: Array<Asset>;
};
