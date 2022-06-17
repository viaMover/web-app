import { DiceType } from '@/services/chain';
import {
  Attribute as ENSAttribute,
  ENSAPIService
} from '@/services/v2/api/ens';
import {
  Attribute as UNSAttribute,
  UNSAPIService
} from '@/services/v2/api/uns';
import { ENSOnChainService } from '@/services/v2/on-chain/ens/ENSOnChainService';
import { UNSOnChainService } from '@/services/v2/on-chain/uns';
import { Network } from '@/utils/networkTypes';

import { Step } from '@/components/forms/form-loader';
import { PictureDescriptor } from '@/components/html5';

export type NFTStoreState = {
  isLoading: boolean;

  orderOfLiberty: NftAsset<NftAssetId.OrderOfLiberty>;
  movingWithOlympus: NftAsset<NftAssetId.MovingWithOlympus>;
  unexpectedMove: NftAsset<NftAssetId.UnexpectedMove>;
  sweetAndSour: NftAsset<NftAssetId.SweetAndSour>;
  vaults: NftAsset<NftAssetId.Vaults>;
  dice: NftAsset<NftAssetId.Dice>;
  swapPassport: NftAsset<NftAssetId.SwapPassport> | undefined;
  baseledgerStakingOG: NftAsset<NftAssetId.BaseledgerStakingOG>;
  ens: NftAsset<NftAssetId.ENS>;
  uns: NftAsset<NftAssetId.UNS>;

  ensOnChainService: ENSOnChainService | undefined;
  ensAPIService: ENSAPIService | undefined;
  unsOnChainService: UNSOnChainService | undefined;
  unsAPIService: UNSAPIService | undefined;
};

export enum NftAssetId {
  MovingWithOlympus = 'moving-with-olympus',
  UnexpectedMove = 'unexpected-move',
  SweetAndSour = 'sweet-&-sour',
  Vaults = 'vaults',
  Dice = 'dice-project',
  SwapPassport = 'swap-passport',
  OrderOfLiberty = 'the-order-of-liberty',
  BaseledgerStakingOG = 'baseledger-staking-og',
  ENS = 'ens',
  UNS = 'uns'
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
  [NftAssetId.OrderOfLiberty]: {
    totalSupply: string;
    availablePrices: Array<string>;
    defaultPrice: string;
  };
  [NftAssetId.BaseledgerStakingOG]: {
    totalSupply: string;
  };
  [NftAssetId.ENS]: {
    description?: string;
    attributes: Array<ENSAttribute>;
    url?: string;
  };
  [NftAssetId.UNS]: {
    description?: string;
    attributes: Array<UNSAttribute>;
    backgroundColor?: string;
    externalUrl?: string;
  };
}

export type TNftAssetKey = keyof NftAssetsMeta;
export interface BaseNftAsset {
  id: string;
  name: string;
  picture: PictureDescriptor;
  bigPicture: PictureDescriptor;
  balance: string;
  networks: Array<Network>;
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

export type OrderOfLibertyPayload = {
  selectedPrice: string;
} & ChangePayload;
