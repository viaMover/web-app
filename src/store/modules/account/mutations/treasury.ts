import { MutationTree } from 'vuex';
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
  }
} as MutationTree<AccountStoreState>;
