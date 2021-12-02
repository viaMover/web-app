import { EthereumInfo } from '@/services/mover';

export type EarningsEthereumStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  ethereumAPY: string | undefined;
  ethereumBalance: string | undefined;

  isEthereumInfoLoading: boolean;
  ethereumInfo: EthereumInfo | undefined;
  ethereumInfoError: string | undefined;
};
