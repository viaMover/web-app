import { PowercardState } from '@/services/chain';
import { TreasuryInfo, TreasuryReceipt } from '@/services/mover';

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

  isTreasuryReceiptLoading: boolean;
  treasuryReceipt: TreasuryReceipt | undefined;
  treasuryReceiptError: string | undefined;

  powercardBalance: string | undefined;
  powercardState: PowercardState | undefined;
  powercardActiveTime: number;
  powercardCooldownTime: number;
};

export type TreasuryGetReceiptPayload = {
  year: number;
  month: number;
};
