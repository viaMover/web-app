import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { SavingsPlusStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isInfoLoading: false,
    info: undefined,

    receipts: new Map(),

    balance: undefined,
    APY: undefined,
    DPY: undefined,
    apiService: undefined,
    onChainService: undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<
  SavingsPlusStoreState,
  ActionType,
  GetterType,
  MutationType
>;
