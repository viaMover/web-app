import { PictureDescriptor } from '@/components/html5';

export type NFTStoreState = {
  isLoading: boolean;

  UnexpectedMoveTotalAmount: string;
  UnexpectedMoveTotalClaimed: string;
  UnexpectedMoveTotalExchanged: string;
  UnexpectedMoveBalance: string;

  SweetAndSourTotalAmount: string;
  SweetAndSourTotalClaimed: string;

  nfts: Array<NftAsset>;
};

export type NftAsset = {
  name: string;
  description: string;
  picture: PictureDescriptor;
  bigPicture: PictureDescriptor;
  meta: Array<MetaItem>;
};

export type MetaItem = {
  name: string;
  value: string | number;
};
