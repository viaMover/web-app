import dayjs from 'dayjs';

import {
  CardInfo as ServiceCardInfo,
  CardStatus as ServiceState,
  EventHistoryItemMinimal as ServiceHistoryItem
} from '@/services/mover/debit-card';

import { PictureDescriptor } from '@/components/html5';

export type DebitCardStoreState = {
  isLoading: boolean;
  isInitialized: boolean;
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
  last4Digits: string;
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
    case 'CARD_ORDER_PENDING':
    case 'CARD_SHIPPED':
      return { cardState: 'pending', orderState: undefined };
    case 'ACTIVE':
    default:
      return { cardState: 'active', orderState: undefined };
  }
};

export const mapServiceHistoryItem = (
  serviceItem: ServiceHistoryItem
): EventHistoryItemMinimal => {
  switch (serviceItem.status) {
    case 'PHONE_VERIFICATION_PENDING':
    case 'KYC_PENDING':
      return {
        type: 'order_process_started',
        timestamp: serviceItem.timestamp
      };
    case 'KYC_WAITING':
      return { type: 'kyc_process_started', timestamp: serviceItem.timestamp };
    case 'CARD_ORDER_PENDING':
      return { type: 'documents_verified', timestamp: serviceItem.timestamp };
    case 'CARD_SHIPPED':
    default:
      return { type: 'card_shipped', timestamp: serviceItem.timestamp };
  }
};

export const mapServiceCardInfo = (serviceInfo: ServiceCardInfo): CardInfo => {
  const expirationDate = dayjs(
    new Date(serviceInfo.expYear, serviceInfo.expMonth - 1, 1)
  );
  return {
    bic: serviceInfo.bic,
    expiryDate: expirationDate.format('MM/YY'),
    iban: serviceInfo.iban,
    last4Digits: serviceInfo.last4Digits
  };
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
