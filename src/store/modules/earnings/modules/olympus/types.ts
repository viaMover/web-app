export type EarningsOlympusStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  olympusAPY: string | undefined;
  olympusBalance: string | undefined;
};
