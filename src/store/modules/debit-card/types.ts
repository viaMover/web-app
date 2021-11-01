export type DebitCardStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  availableSkins: Array<SkinMinimal>;
  currentSkin: SkinMinimal;
  cardState: CardState;

  cardInfo: CardInfo | undefined;
  eventHistory: Array<EventHistoryItemMinimal>;
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
};

export type Skin = {
  name: string;
  description: string;
} & SkinMinimal;

export type HistoryItem = {
  id: string;
  icon: string;
  timestamp: undefined;
  description: string;
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

export type ValidateOrOrderCardParams = {
  email: string;
};
