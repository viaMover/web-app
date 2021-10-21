import { MutationTree } from 'vuex';

import { PowercardState } from '@/services/chain';
import { TreasuryInfo, TreasuryReceipt } from '@/services/mover';

import { AccountStoreState } from '../types';

export default {
  setTreasuryBalanceMove(state, moveBalance: string): void {
    state.treasuryBalanceMove = moveBalance;
  },
  setTreasuryBalanceLP(state, lpBalance: string): void {
    state.treasuryBalanceLP = lpBalance;
  },
  setTreasuryBonus(state, bonus: string): void {
    state.treasuryBonus = bonus;
  },
  setTreasuryAPY(state, apy: string): void {
    state.treasuryAPY = apy;
  },
  setTreasuryTotalStakedMove(state, totalStakedMove: string): void {
    state.treasuryTotalStakedMove = totalStakedMove;
  },
  setTreasuryTotalStakedMoveEthLP(state, totalStakedMoveEthLP: string): void {
    state.treasuryTotalStakedMoveEthLP = totalStakedMoveEthLP;
  },
  setIsTreasuryInfoLoading(state, isLoading: boolean): void {
    state.isTreasuryInfoLoading = isLoading;
  },
  setTreasuryInfoError(state, error: string | undefined): void {
    state.treasuryInfoError = error;
  },
  setTreasuryInfo(state, info: TreasuryInfo | undefined): void {
    state.treasuryInfo = info;
  },
  setIsTreasuryReceiptLoading(state, isLoading: boolean): void {
    state.isTreasuryReceiptLoading = isLoading;
  },
  setTreasuryReceiptError(state, error: string | undefined): void {
    state.treasuryReceiptError = error;
  },
  setTreasuryReceipt(state, receipt: TreasuryReceipt): void {
    state.treasuryReceipt = receipt;
  },
  setPowercardBalance(state, balance: string): void {
    state.powercardBalance = balance;
  },
  setPowercardState(state, powercardState: PowercardState): void {
    state.powercardState = powercardState;
  },
  setPowercardActiveTime(state, activeTime: number): void {
    state.powercardActiveTime = activeTime;
  },
  setPowercardCooldownTime(state, cooldownTime: number): void {
    state.powercardCooldownTime = cooldownTime;
  }
} as MutationTree<AccountStoreState>;
