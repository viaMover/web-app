import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { EarningsOlympusStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoading: false,
    error: undefined,

    olympusAPY: undefined,
    olympusBalance: undefined,

    isOlympusInfoLoading: false,
    olympusInfo: undefined,
    olympusInfoError: undefined,
    olympusPriceInWeth: undefined,

    olympusReceiptCache: {},
    olympusReceiptError: undefined,
    isOlympusReceiptLoading: false
  },
  actions,
  getters,
  mutations
} as AugmentedModule<
  EarningsOlympusStoreState,
  ActionType,
  GetterType,
  MutationType
>;
