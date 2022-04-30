import {
  MoverAPISavingsPlusService,
  SavingsPlusInfo
} from '@/services/v2/api/mover/savings-plus';
import { SavingsPlusOnChainService } from '@/services/v2/on-chain/mover/savings-plus';
import { DataStore, DataStoreWrapper } from '@/store/types';

export type SavingsPlusStoreState = {
  isInfoLoading: boolean;
  info: DataStoreWrapper<SavingsPlusInfo> | undefined;

  receipts: DataStore<SavingsPlusReceipt>;

  balance: string | undefined;
  APY: string | undefined;
  DPY: string | undefined;
  onChainService: SavingsPlusOnChainService | undefined;
  apiService: MoverAPISavingsPlusService | undefined;
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

export const ensureOnChainServiceExists = (
  state: SavingsPlusStoreState
): state is SavingsPlusStoreState & {
  onChainService: SavingsPlusOnChainService;
} => {
  return state.onChainService !== undefined;
};

export const ensureAPIServiceExists = (
  state: SavingsPlusStoreState
): state is SavingsPlusStoreState & {
  apiService: MoverAPISavingsPlusService;
} => {
  return state.apiService !== undefined;
};
