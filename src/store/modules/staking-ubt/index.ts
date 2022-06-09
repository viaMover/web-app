import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { StakingUbtStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isInfoLoading: true,
    info: undefined,
    receipts: new Map(),

    ubtNativePrice: undefined,

    apy: undefined,
    dpy: undefined,
    contractUbtBalance: undefined,

    apiService: undefined,
    onChainService: undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<
  StakingUbtStoreState,
  ActionType,
  GetterType,
  MutationType
>;
