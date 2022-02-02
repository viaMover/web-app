import { PowercardState } from '@/services/chain';
import { TreasuryInfo, TreasuryReceipt } from '@/services/mover';
import { DataStore } from '@/store/types';

export type TreasuryStoreState = {
  treasuryBalanceMove: string | undefined;
  treasuryBalanceLP: string | undefined;
  treasuryBonus: string | undefined;
  treasuryAPY: string | undefined;
  treasuryTotalStakedMove: string | undefined;
  treasuryTotalStakedMoveEthLP: string | undefined;

  isTreasuryInfoLoading: boolean;
  treasuryInfo: TreasuryInfo | undefined;
  treasuryInfoError: string | undefined;

  receipts: DataStore<TreasuryReceipt>;

  powercardBalance: string | undefined;
  powercardState: PowercardState | undefined;
  powercardActiveTime: number;
  powercardCooldownTime: number;
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
