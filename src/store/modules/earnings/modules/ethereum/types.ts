export type EarningsEthereumStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  ethereumAPY: string | undefined;
  ethereumBalance: string | undefined;
};
