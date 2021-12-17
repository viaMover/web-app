export class NibbleShopApiError<T> extends Error {
  constructor(
    readonly message: string,
    readonly shortMessage?: string,
    readonly additionalPayload?: T
  ) {
    super(message);
  }
}

export type NibbleShopRedeemPayload = {
  tokenId: string; // from contract
  accountAddress: string;
  email: string;
  name: string;
  country: string;
  address: string;
  postalCode: string;
};
export type NibbleShopRedeemRequestPayload = {
  data: NibbleShopRedeemPayload;
  sig: string;
};
