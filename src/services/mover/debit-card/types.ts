export class DebitCardApiError extends Error {
  constructor(readonly message: string) {
    super();
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

export type CardAggregatedInfo = {
  info: {
    number: string;
    expiryDate: string;
    iban: string;
    bic: string;
  };
  state: 'active' | 'frozen' | 'pending' | 'expired' | 'order_now';
  eventHistory: Array<EventHistoryItemMinimal>;
  orderState: 'order_form' | 'validatePhone' | null;
};

type Request<T> = {
  data: T;
  meta: {
    address: string;
    hash: string;
    sig: string;
  };
};

export type CardInfoRequestPayload = Request<{ email: string | null }>;

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

export type ValidatePhoneNumberRequestPayload = Request<{ code: string }>;

export type ChangePhoneNumberRequestPayload = Request<{ phone: string }>;
