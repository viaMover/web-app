import { MoverResponse } from './../responses';
export class NibbleShopApiError<T> extends Error {
  constructor(
    readonly message: string,
    readonly shortMessage?: string,
    readonly additionalPayload?: T
  ) {
    super(message);
  }
}

export type NibbleShopRedeemResponsePayload = MoverResponse<void>;

export type NibbleShopRedeemPayload = {
  accountAddress: string;
  address: string;
  country: string;
  email: string;
  name: string;
  postalCode: string;
  tokenId: number; // from contract
};
export type NibbleShopRedeemRequestPayload = {
  data: NibbleShopRedeemPayload;
  sig: string;
};
