export type Asset = {
  id: number;
  name: string;
  icon: string;
  blackBorder: boolean;
};

export type RadarStoreState = {
  isLoadingPersonalList: boolean;
  isLoadingCuratedList: boolean;
  loadingPersonalListPromise: Promise<Array<Asset>> | undefined;
  loadingCuratedListPromise: Promise<Array<Asset>> | undefined;
  personalList: Array<Asset> | undefined;
  curatedList: Array<Asset> | undefined;
};
