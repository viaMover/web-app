import { EthereumReceipt, OlympusInfo } from '@/services/mover';

export type EarningsOlympusStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  olympusAPY: string | undefined;
  olympusBalance: string | undefined;

  isOlympusInfoLoading: boolean;
  olympusInfo: OlympusInfo | undefined;
  olympusInfoError: string | undefined;
  olympusPriceInWeth: undefined | string;

  olympusReceiptCache: Record<string, EthereumReceipt>;
  isOlympusReceiptLoading: boolean;
  olympusReceiptError: string | undefined;
};

export type SetOlympusReceiptPayload = {
  receipt: EthereumReceipt;
  month: number;
  year: number;
};

export type FetchOlympusReceiptPayload = {
  month: number;
  year: number;
};
