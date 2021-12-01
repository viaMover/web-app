import { OlympusInfo } from '@/services/mover/earnings/types';

export type EarningsOlympusStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  olympusAPY: string | undefined;
  olympusBalance: string | undefined;

  isOlympusInfoLoading: boolean;
  olympusInfo: OlympusInfo | undefined;
  olympusInfoError: string | undefined;
};
