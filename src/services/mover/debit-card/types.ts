export class DebitCardApiError extends Error {
  constructor(readonly message: string) {
    super();
  }
}

export type EventHistoryItem = {
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
  eventHistory: Array<EventHistoryItem>;
};
