import { DataStore, DataStoreWrapper } from '@/store/types';

export type SavingsPlusStoreState = {
  isInfoLoading: boolean;
  info: DataStoreWrapper<SavingsPlusInfo> | undefined;

  receipts: DataStore<SavingsPlusReceipt>;

  balance: string | undefined;
  APY: string | undefined;
  DPY: string | undefined;
};

export type SavingsPlusGetReceiptPayload = {
  year: number;
  month: number;
};

export type SetSavingsPlusReceiptPayload = {
  year: number;
  month: number;
  receipt: Promise<SavingsPlusReceipt> | undefined;
};

export type SavingsPlusReceipt = {
  //TODO
};

export type SavingsPlusInfo = {
  currentBalance: number;
  earnedTotal: number;
  last12MonthsBalances: Array<{ balance: number }>;
  //TODO
};
