import { DiceType } from '@/services/chain';

import { Step } from '@/components/forms/form-loader';
import { PictureDescriptor } from '@/components/html5';

export type NFTStoreState = {
  isLoading: boolean;

  movingWithOlympus: NftAsset<NftAssetId.MovingWithOlympus>;
  unexpectedMove: NftAsset<NftAssetId.UnexpectedMove>;
  sweetAndSour: NftAsset<NftAssetId.SweetAndSour>;
  vaults: NftAsset<NftAssetId.Vaults>;
  dice: NftAsset<NftAssetId.Dice>;
  swapPassport: NftAsset<NftAssetId.SwapPassport> | undefined;
};

export enum NftAssetId {
  MovingWithOlympus = 'olympus',
  UnexpectedMove = 'unexpected-move',
  SweetAndSour = 'sweet-and-sour',
  Vaults = 'vaults',
  Dice = 'dice',
  SwapPassport = 'swap-passport'
}

export interface NftAssetsMeta {
  [NftAssetId.MovingWithOlympus]: {
    totalClaimed: string;
    startTs: string;
    endTs: string;
  };
  [NftAssetId.UnexpectedMove]: {
    totalAmount: string;
    totalClaimed: string;
    totalExchanged: string;
  };
  [NftAssetId.SweetAndSour]: {
    totalAmount: string;
    totalClaimed: string;
  };
  [NftAssetId.Vaults]: {
    totalAmount: string;
    totalClaimed: string;
  };
  [NftAssetId.Dice]: {
    totalClaimed: string;
  };
  [NftAssetId.SwapPassport]: void;
}

export type TNftAssetKey = keyof NftAssetsMeta;
export interface BaseNftAsset {
  id: string;
  name: string;
  picture: PictureDescriptor;
  bigPicture: PictureDescriptor;
  balance: string;
}
export type NftAsset<I extends TNftAssetKey> = {
  id: I;
  meta: NftAssetsMeta[I];
} & BaseNftAsset;

export type ChangePayload = {
  changeStep: (step: Step) => void;
};

export type ClaimPayload = {
  signature: string;
} & ChangePayload;

export type DicePayload = {
  diceType: DiceType;
} & ChangePayload;
