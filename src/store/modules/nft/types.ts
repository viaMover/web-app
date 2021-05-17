export type NFT = {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
};

export type NFTAggregatedInfo = {
  nft: NFT;
  totalNumber: number;
  totalClaimed: number;
};

export type NFTStoreState = {
  isLoading: boolean;
  loadingPromise: Promise<Array<NFTAggregatedInfo>> | null;
  NFTs: Array<NFTAggregatedInfo>;
};
