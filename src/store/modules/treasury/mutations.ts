import {
  MoverAPISmartTreasuryService,
  TreasuryInfo
} from '@/services/v2/api/mover/smart-treasury';
import {
  PowercardState,
  SmartTreasuryOnChainService
} from '@/services/v2/on-chain/mover/smart-treasury';
import { MutationFuncs } from '@/store/types';

import { INFO_TIME_EXPIRE, RECEIPT_TIME_EXPIRE } from './actions';
import { SetTreasuryReceiptPayload, TreasuryStoreState } from './types';

type Mutations = {
  setTreasuryBalanceMove: void;
  setTreasuryBalanceLP: void;
  setTreasuryBonus: void;
  setTreasuryAPY: void;
  setTreasuryTotalStakedMove: void;
  setTreasuryTotalStakedMoveEthLP: void;
  setIsTreasuryInfoLoading: void;
  setTreasuryInfo: void;
  setTreasuryReceipt: void;
  setPowercardBalance: void;
  setPowercardState: void;
  setPowercardActiveTime: void;
  setPowercardCooldownTime: void;
  setOnChainService: void;
  setAPIService: void;
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
  setTreasuryInfo(state, info: TreasuryInfo | undefined): void {
    if (info === undefined) {
      state.treasuryInfo = info;
      return;
    }

    state.treasuryInfo = { data: info, expDate: Date.now() + INFO_TIME_EXPIRE };
  },
  setTreasuryReceipt(state, payload: SetTreasuryReceiptPayload): void {
    const key = `${payload.year}/${payload.month}`;
    if (payload.receipt === undefined) {
      state.receipts.delete(key);
    } else {
      state.receipts.set(key, {
        data: payload.receipt,
        expDate: Date.now() + RECEIPT_TIME_EXPIRE
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
  },
  setOnChainService(state, service: SmartTreasuryOnChainService): void {
    state.onChainService = service;
  },
  setAPIService(state, service: MoverAPISmartTreasuryService): void {
    state.apiService = service;
  }
};

export type MutationType = typeof mutations;
export default mutations;
