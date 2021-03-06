import { Step } from '@/components/forms/form-loader';

export type Asset = {
  active: boolean;
  id: string;
  urlId: string;
  intId: number;
  address: string;
  feeAmount: string;
  balance: number;
  initialQuantity: number;
  totalClaimed: number;
  redeemCount: number;
  title: string;
  shortName: string;
  preview: {
    videoSrc: string;
    background: string;
  };
  page: {
    videoSrc: string;
    background: string;
  };
};

export type TokenData = {
  tokenId: string;
  tokenIntId: number;
  balance: number;
  initialQuantity?: number;
  totalClaimed: number;
  redeemCount: number;
  feeAmount: string;
};

export type SetAssetData = {
  assetId: string;
  asset: TokenData;
};

export type Country = {
  name: string;
  code: string;
};

export type ShopStoreState = {
  assets: Array<Asset>;
  isLoading: boolean;
  countries: Array<Country>;
};

export type RedeemParams = {
  tokenIntId: number;
  tokenUrl: string;
  email: string;
  name: string;
  country: string;
  address: string;
  postalCode: string;
};

export type RedeemPayload = {
  changeStep: (step: Step) => void;
  tokenId: string;
  signature: string;
};

export type ClaimPayload = {
  changeStep: (step: Step) => void;
  tokenId: string;
};
