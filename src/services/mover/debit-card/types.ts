import { MoverResponse, MoverResponseExtended } from '../responses';
export class DebitCardApiError<T> extends Error {
  constructor(
    readonly message: string,
    readonly shortMessage?: string,
    readonly additionalPayload?: T
  ) {
    super(message);
  }
}

export class DebitCardNotSupportedCountryError extends DebitCardApiError<NotSupportedCountryErrorPayload> {}

export type CardStatus =
  | 'NOT_REGISTERED' // user did not fill personal data form yet
  | 'PHONE_VERIFICATION_PENDING' // account is signed up, SMS sent to phone number provided
  | 'KYC_WAITING' // user verified phone, but not passed KYC yet
  | 'KYC_PENDING' // user has passed KYC, it is being verified (wait)
  | 'CARD_ORDER_PENDING' // user has verified phone and passed KYC, we would order card;
  | 'CARD_SHIPPED' // the card is ordered, to be shipped
  | 'CARD_ACTIVE'; // the card is active

export type EventHistoryItemMinimal = {
  timestamp: number;
  status: CardStatus;
};

type Request<T> = {
  data: T;
  meta: {
    address: string;
    hash: string;
    sig: string;
  };
};

type BaseResponse = {
  status: CardStatus;
  KYClink: string | undefined;
  statusHistory: Array<EventHistoryItemMinimal> | undefined;
  cardInfo: CardInfo | undefined;
};

export type CardInfo = {
  // card status while it's should be active
  // (e.g. frozen, expired)
  // Note: check if this field is active
  status: CardStatus;
  // customer name
  displayName: string;
  last4Digits: string;
  // expiration month (natural, 1-based index)
  expMonth: number;
  // expiraton year (natural, 1-based index)
  expYear: number;
  currency: string;
  type: string;
  // ISO string
  issueDate: string;
  temporaryBlocked: boolean;
  iban: string;
  bic: string;
};

export type CardInfoRequestPayload = Request<{ email: string }>;
export type CardInfoResponsePayload = MoverResponse<BaseResponse>;

export type BaseReturn = {
  status: CardStatus;
  KYClink: string | undefined;
  statusHistory: Array<EventHistoryItemMinimal> | undefined;
  cardInfo: CardInfo | undefined;
};

export type OrderCardPayload = {
  email: string;
  phone: string;
  gender: 'M' | 'F';
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  title: string;
};
export type OrderCardRequestPayload = Request<{
  info: OrderCardPayload;
  sig: string;
}>;
export type NotSupportedCountryErrorPayload = {
  country: string;
  countryName: string;
};
export type OrderCardResponsePayload = MoverResponseExtended<
  BaseResponse,
  NotSupportedCountryErrorPayload
>;
export type OrderCardReturn = BaseReturn;

export type ValidatePhoneNumberRequestPayload = Request<{ code: string }>;
export type ValidatePhoneNumberResponsePayload = MoverResponse<BaseResponse>;
export type ValidatePhoneNumberReturn = BaseReturn;

export type ChangePhoneNumberRequestPayload = Request<{ phone: string }>;
export type ChangePhoneNumberResponsePayload = MoverResponse<BaseResponse>;
export type ChangePhoneNumberReturn = BaseReturn;
