import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { SavingsStoreState } from './types';

export const initialState: SavingsStoreState = {
  isSavingsInfoLoading: true,
  savingsInfo: undefined,

  receipts: new Map(),

  savingsBalance: undefined,
  savingsAPY: undefined,
  savingsDPY: undefined,
  apiService: undefined,
  onChainService: undefined
};

export default {
  namespaced: true,
  strict: !isProduction(),
  state: () => initialState,
  actions,
  getters,
  mutations
} as AugmentedModule<SavingsStoreState, ActionType, GetterType, MutationType>;
