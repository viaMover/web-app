import { CardStatus as ServiceState } from '@/services/mover/debit-card';

import { PictureDescriptor } from '@/components/html5';

export type DebitCardStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;
  loadingPromise: Promise<void> | undefined;

  availableSkins: Array<SkinMinimal> | undefined;
  currentSkin: SkinMinimal | undefined;
  cardState: CardState;

  cardInfo: CardInfo | undefined;
  eventHistory: Array<EventHistoryItemMinimal>;

  email: string | undefined;
  emailHash: string | undefined;
  emailSignature: string | undefined;
  phoneNumber: string | undefined;
  orderState: OrderState | undefined;
  kycLink: string | undefined;
};

export type CardInfo = {
  number: string;
  expiryDate: string;
  iban: string;
  bic: string;
};

export type SkinMinimal = {
  id: string;
  symbol: string;
  nftAddress: string | undefined;
  color: string;
};

export type Skin = {
  name: string;
  description: string;
  picture: PictureDescriptor;
  previewPicture: PictureDescriptor;
} & SkinMinimal;

export type EventHistoryItem = {
  icon: string;
  timestamp: number;
  description: string;
};

export type EventHistoryItemGroup = {
  timestamp: number;
  events: Array<EventHistoryItem>;
};

export type EventHistoryItemMinimal = {
  timestamp: number;
  type:
    | 'order_process_started'
    | 'kyc_process_started'
    | 'documents_verified'
    | 'card_shipped';
};

export type CardState =
  | 'active'
  | 'frozen'
  | 'pending'
  | 'expired'
  | 'order_now';

export type OrderState = 'order_form' | 'validate_phone' | 'change_phone';

export interface ResponseWithCardStatus {
  status: ServiceState;
}

export const mapServiceState = (
  serviceState: ServiceState
): { cardState: CardState; orderState: OrderState | undefined } => {
  switch (serviceState) {
    case 'NOT_REGISTERED':
      return { cardState: 'order_now', orderState: 'order_form' };
    case 'PHONE_VERIFICATION_PENDING':
    case 'KYC_PENDING':
      return { cardState: 'order_now', orderState: 'validate_phone' };
    case 'KYC_WAITING':
    case 'CARD_ORDERING':
      return { cardState: 'pending', orderState: undefined };
    default:
      return { cardState: 'active', orderState: undefined };
  }
};

export type OrderCardParams = {
  email: string;
  phone: string;
  gender: 'M' | 'F';
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  title: string;
};
