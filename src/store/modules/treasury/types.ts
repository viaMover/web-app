import {
  MoverAPISmartTreasuryService,
  TreasuryInfo,
  TreasuryReceipt
} from '@/services/v2/api/mover/smart-treasury';
import {
  PowercardState,
  SmartTreasuryOnChainService
} from '@/services/v2/on-chain/mover/smart-treasury';
import { DataStore, DataStoreWrapper } from '@/store/types';

export type TreasuryStoreState = {
  treasuryBalanceMove: string | undefined;
  treasuryBalanceLP: string | undefined;
  treasuryBonus: string | undefined;
  treasuryAPY: string | undefined;
  treasuryTotalStakedMove: string | undefined;
  treasuryTotalStakedMoveEthLP: string | undefined;

  isTreasuryInfoLoading: boolean;
  treasuryInfo: DataStoreWrapper<TreasuryInfo> | undefined;

  receipts: DataStore<TreasuryReceipt>;

  powercardBalance: string | undefined;
  powercardState: PowercardState | undefined;
  powercardActiveTime: number;
  powercardCooldownTime: number;

  onChainService: SmartTreasuryOnChainService | undefined;
  apiService: MoverAPISmartTreasuryService | undefined;
};

export type TreasuryGetReceiptPayload = {
  year: number;
  month: number;
};

export type SetTreasuryReceiptPayload = {
  year: number;
  month: number;
  receipt: Promise<TreasuryReceipt> | undefined;
};

export const ensureOnChainServiceExists = (
  state: TreasuryStoreState
): state is TreasuryStoreState & {
  onChainService: SmartTreasuryOnChainService;
} => {
  return state.onChainService !== undefined;
};

export const ensureAPIServiceExists = (
  state: TreasuryStoreState
): state is TreasuryStoreState & {
  apiService: MoverAPISmartTreasuryService;
} => {
  return state.apiService !== undefined;
};
