import { PictureDescriptor } from '@/components/html5';

export type NFTStoreState = {
  isLoading: boolean;

  OlympusTotalClaimed: string;
  OlympusStartTs: string;
  OlympusEndTs: string;
  OlympusBalance: string;

  UnexpectedMoveTotalAmount: string;
  UnexpectedMoveTotalClaimed: string;
  UnexpectedMoveTotalExchanged: string;
  UnexpectedMoveBalance: string;

  SweetAndSourTotalAmount: string;
  SweetAndSourTotalClaimed: string;
  SweetAndSourBalance: string;

  VaultsTotalAmount: string;
  VaultsTotalClaimed: string;
  VaultsBalance: string;

  DiceTotalClaimed: string;
  DiceBalance: string;

  nfts: Array<NftAssetWithBalance>;
};

export type NftAssetId =
  | 'olympus'
  | 'unexpected-move'
  | 'sweet-and-sour'
  | 'vaults'
  | 'dice'
  | 'swap-passport';

export type NftAsset = {
  // don't use as source of truth or unique identifier
  //
  // should be used as binding data for getter
  id: NftAssetId;
  name: string;
  description: string;
  picture: PictureDescriptor;
  bigPicture: PictureDescriptor;
  meta: Array<MetaItem>;
};

export type NftAssetWithBalance = NftAsset & {
  balance: string;
};

export type MetaItem = {
  name: string;
  value: string | number;
};
