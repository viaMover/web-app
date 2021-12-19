import { OlympusInfo, OlympusReceipt } from '@/services/mover';

export type EarningsOlympusStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  olympusAPY: string | undefined;
  olympusBalance: string | undefined;

  isOlympusInfoLoading: boolean;
  olympusInfo: OlympusInfo | undefined;
  olympusInfoError: string | undefined;
  olympusPriceInWeth: undefined | string;

  olympusReceiptCache: Record<string, OlympusReceipt>;
  isOlympusReceiptLoading: boolean;
  olympusReceiptError: string | undefined;
};

export type SetOlympusReceiptPayload = {
  receipt: OlympusReceipt;
  month: number;
  year: number;
};

export type FetchOlympusReceiptPayload = {
  month: number;
  year: number;
};
