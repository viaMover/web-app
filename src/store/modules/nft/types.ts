import { DiceType } from '@/services/chain';

import { Step } from '@/components/forms/form-loader';
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

  VaultsTotalAmount: string;
  VaultsTotalClaimed: string;

  DiceTotalClaimed: string;

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

export type ChangePayload = {
  changeStep: (step: Step) => void;
};

export type ClaimPayload = {
  signature: string;
} & ChangePayload;

export type DicePayload = {
  diceType: DiceType;
} & ChangePayload;
