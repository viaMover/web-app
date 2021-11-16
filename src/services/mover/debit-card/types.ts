import { MoverResponse } from '../responses';
export class DebitCardApiError extends Error {
  constructor(readonly message: string, readonly shortMessage?: string) {
    super(message);
  }
}

export type EventHistoryItemMinimal = {
  timestamp: number;
  type:
    | 'order_process_started'
    | 'kyc_process_started'
    | 'documents_verified'
    | 'card_shipped';
};

export type CardStatus =
  | 'NOT_REGISTERED' // user did not filled personal data form yet
  | 'PHONE_VERIFICATION_PENDING' // account is signed up, SMS sent to phone number provided
  | 'KYC_WAITING' // user verified phone, but not passed KYC yet
  | 'KYC_PENDING' // user has passed KYC, it is being verified (wait)
  | 'CARD_ORDERING'; // user has verified phone and passed KYC, we would order card;

type Request<T> = {
  data: T;
  meta: {
    address: string;
    hash: string;
    sig: string;
  };
};

type BaseResponse = { status: CardStatus };

export type CardInfoRequestPayload = Request<{ email: string }>;
export type CardInfoResponsePayload = MoverResponse<
  {
    KYClink: string | undefined;
  } & BaseResponse
>;
export type FetchInfoReturn = {
  status: CardStatus;
  KYClink: string | undefined;
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
export type OrderCardResponsePayload = MoverResponse<BaseResponse>;
export type OrderCardReturn = { status: CardStatus };

export type ValidatePhoneNumberRequestPayload = Request<{ code: string }>;
export type ValidatePhoneNumberResponsePayload = MoverResponse<
  {
    KYClink: string;
  } & BaseResponse
>;
export type ValidatePhoneNumberReturn = {
  status: CardStatus;
  KYClink: string;
};

export type ChangePhoneNumberRequestPayload = Request<{ phone: string }>;
export type ChangePhoneNumberResponsePayload = MoverResponse<BaseResponse>;
export type ChangePhoneNumberReturn = {
  status: CardStatus;
};
