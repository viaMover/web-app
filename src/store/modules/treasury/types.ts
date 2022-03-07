import { PowercardState } from '@/services/chain';
import { TreasuryInfo, TreasuryReceipt } from '@/services/mover';
import { MoverAPISmartTreasuryService } from '@/services/v2/api/mover/smart-treasury/MoverAPISmartTreasuryService';
import { SmartTreasuryOnChainService } from '@/services/v2/on-chain/mover/smart-treasury/SmartTreasuryOnChainService';
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

  onChainService: SmartTreasuryOnChainService;
  apiService: MoverAPISmartTreasuryService;
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
