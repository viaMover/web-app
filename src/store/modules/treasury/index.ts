import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { TreasuryStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isTreasuryInfoLoading: true,
    treasuryInfo: undefined,

    receipts: new Map(),

    treasuryBalanceMove: undefined,
    treasuryBalanceLP: undefined,
    treasuryBonus: undefined,
    treasuryAPY: undefined,
    treasuryTotalStakedMove: undefined,
    treasuryTotalStakedMoveEthLP: undefined,

    powercardBalance: undefined,
    powercardState: undefined,
    powercardActiveTime: 0,
    powercardCooldownTime: 0,
    apiService: undefined,
    onChainService: undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<TreasuryStoreState, ActionType, GetterType, MutationType>;
