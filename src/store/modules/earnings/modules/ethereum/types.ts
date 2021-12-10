import { EthereumInfo, EthereumReceipt } from '@/services/mover';

export type EarningsEthereumStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;

  ethereumAPY: string | undefined;
  ethereumBalance: string | undefined;

  isEthereumInfoLoading: boolean;
  ethereumInfo: EthereumInfo | undefined;
  ethereumInfoError: string | undefined;

  ethereumReceiptCache: Record<string, EthereumReceipt>;
  isEthereumReceiptLoading: boolean;
  ethereumReceiptError: string | undefined;
};

export type SetEthereumReceiptPayload = {
  receipt: EthereumReceipt;
  month: number;
  year: number;
};

export type FetchEthereumReceiptPayload = {
  month: number;
  year: number;
};
