export type NFT = {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  imageScaleH: string;
  imageScaleV: string;
  imageSize: string;
  previewImageSrc: string;
  page: {
    description: string;
    iconSrc: string;
    videoSrc: string;
    imageBackground: string;
    imageWidth: string;
  };
  background: string;
  titleColor: string;
  textColor: string;
  btnBackgroundColor: string;
  btnTextColor: string;
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
