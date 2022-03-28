import {
  MoverAPISavingsService,
  SavingsInfo,
  SavingsReceipt
} from '@/services/v2/api/mover/savings';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings';
import { DataStore, DataStoreWrapper } from '@/store/types';

export type SavingsStoreState = {
  isSavingsInfoLoading: boolean;
  savingsInfo: DataStoreWrapper<SavingsInfo> | undefined;

  receipts: DataStore<SavingsReceipt>;

  savingsBalance: string | undefined;
  savingsAPY: string | undefined;
  savingsDPY: string | undefined;
  onChainService: SavingsOnChainService | undefined;
  apiService: MoverAPISavingsService | undefined;
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

export const ensureOnChainServiceExists = (
  state: SavingsStoreState
): state is SavingsStoreState & { onChainService: SavingsOnChainService } => {
  return state.onChainService !== undefined;
};

export const ensureAPIServiceExists = (
  state: SavingsStoreState
): state is SavingsStoreState & { apiService: MoverAPISavingsService } => {
  return state.apiService !== undefined;
};
