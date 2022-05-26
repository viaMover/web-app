import {
  MoverAPIStakingUbtService,
  StakingUbtInfo,
  StakingUbtReceipt
} from '@/services/v2/api/mover/staking-ubt';
import { StakingUbtOnChainService } from '@/services/v2/on-chain/mover/staking-ubt';
import { DataStore, DataStoreWrapper } from '@/store/types';

export type StakingUbtStoreState = {
  isInfoLoading: boolean;
  info: DataStoreWrapper<StakingUbtInfo> | undefined;
  receipts: DataStore<StakingUbtReceipt>;

  ubtNativePrice: string | undefined;
  contractUbtBalance: string | undefined;
  apy: string | undefined;
  dpy: string | undefined;
  apiService: MoverAPIStakingUbtService | undefined;
  onChainService: StakingUbtOnChainService | undefined;
};

export type StakingUbtGetReceiptPayload = {
  year: number;
  month: number;
};

export type SetStakingUbtReceiptPayload = {
  year: number;
  month: number;
  receipt: Promise<StakingUbtReceipt>;
};

export const ensureOnChainServiceExists = (
  state: StakingUbtStoreState
): state is StakingUbtStoreState & {
  onChainService: StakingUbtOnChainService;
} => {
  return state.onChainService !== undefined;
};

export const ensureAPIServiceExists = (
  state: StakingUbtStoreState
): state is StakingUbtStoreState & {
  apiService: MoverAPIStakingUbtService;
} => {
  return state.apiService !== undefined;
};
