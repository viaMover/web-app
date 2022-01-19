import { SavingsInfo, SavingsReceipt } from '@/services/mover';

export type SavingsStoreState = {
  isSavingsInfoLoading: boolean;
  savingsInfo: SavingsInfo | undefined;
  savingsInfoError: string | undefined;

  isSavingsReceiptLoading: boolean;
  savingsReceipt: SavingsReceipt | undefined;
  savingsReceiptError: string | undefined;

  savingsBalance: string | undefined;
  savingsAPY: string | undefined;
  savingsDPY: string | undefined;
};

export type SavingsGetReceiptPayload = {
  year: number;
  month: number;
};
