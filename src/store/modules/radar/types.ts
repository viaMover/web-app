export type Asset = {
  id: number;
  name: string;
  icon: string;
  blackBorder: boolean;
};

export type RadarStoreState = {
  isLoadingPersonalList: boolean;
  isLoadingCuratedList: boolean;
  loadingPersonalListPromise: Promise<Array<Asset>> | null;
  loadingCuratedListPromise: Promise<Array<Asset>> | null;
  personalList: Array<Asset>;
  curatedList: Array<Asset>;
};
