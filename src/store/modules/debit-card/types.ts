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
  emailSignature: string | undefined;
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
  | 'request_email'
  | 'active'
  | 'frozen'
  | 'pending'
  | 'expired'
  | 'order_now';

export type OrderCardParams = {
  email: string;
  phone: string;
  gender: 'M' | 'F' | 'O';
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  honorificPrefix: string;
};
