import { PowercardState } from '@/services/chain';
import { TreasuryInfo } from '@/services/mover';
import { MutationFuncs } from '@/store/types';

import { SetTreasuryReceiptPayload, TreasuryStoreState } from './types';

type Mutations = {
  setTreasuryBalanceMove: void;
  setTreasuryBalanceLP: void;
  setTreasuryBonus: void;
  setTreasuryAPY: void;
  setTreasuryTotalStakedMove: void;
  setTreasuryTotalStakedMoveEthLP: void;
  setIsTreasuryInfoLoading: void;
  setTreasuryInfoError: void;
  setTreasuryInfo: void;
  setTreasuryReceipt: void;
  setPowercardBalance: void;
  setPowercardState: void;
  setPowercardActiveTime: void;
  setPowercardCooldownTime: void;
};

const mutations: MutationFuncs<Mutations, TreasuryStoreState> = {
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
  setTreasuryReceipt(state, payload: SetTreasuryReceiptPayload): void {
    const key = `${payload.year}/${payload.month}`;
    if (payload.receipt === undefined) {
      state.receipts.delete(key);
    } else {
      state.receipts.set(key, {
        data: payload.receipt,
        expDate: Date.now() + 600000 // add 10 min
      });
    }
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
};

export type MutationType = typeof mutations;
export default mutations;