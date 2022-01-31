import { SavingsInfo, SavingsReceipt } from '@/services/mover';
import { DataStore } from '@/store/types';

export type SavingsStoreState = {
  isSavingsInfoLoading: boolean;
  savingsInfo: SavingsInfo | undefined;
  savingsInfoError: string | undefined;

  receipts: DataStore<SavingsReceipt>;

  savingsBalance: string | undefined;
  savingsAPY: string | undefined;
  savingsDPY: string | undefined;
};

export type SavingsGetReceiptPayload = {
  year: number;
  month: number;
};

export type SetSavingsReceiptPayload = {
  year: number;
  month: number;
  receipt: Promise<SavingsReceipt> | undefined;
};
