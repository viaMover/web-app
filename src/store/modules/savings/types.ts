import { SavingsInfo, SavingsReceipt } from '@/services/mover';
import { MoverAPISavingsService } from '@/services/v2/api/mover/savings/MoverAPISavingsService';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings/SavingsOnChainService';
import { DataStore, DataStoreWrapper } from '@/store/types';

export type SavingsStoreState = {
  isSavingsInfoLoading: boolean;
  savingsInfo: DataStoreWrapper<SavingsInfo> | undefined;

  receipts: DataStore<SavingsReceipt>;

  savingsBalance: string | undefined;
  savingsAPY: string | undefined;
  savingsDPY: string | undefined;
  onChainService: SavingsOnChainService;
  apiService: MoverAPISavingsService;
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
