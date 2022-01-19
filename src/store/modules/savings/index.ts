import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { SavingsStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isSavingsInfoLoading: false,
    savingsInfo: undefined,
    savingsInfoError: undefined,

    isSavingsReceiptLoading: false,
    savingsReceipt: undefined,
    savingsReceiptError: undefined,

    savingsBalance: undefined,
    savingsAPY: undefined,
    savingsDPY: undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<SavingsStoreState, ActionType, GetterType, MutationType>;
