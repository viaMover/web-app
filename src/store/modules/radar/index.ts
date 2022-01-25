import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { RadarStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoadingCuratedList: false,
    isLoadingPersonalList: false,
    loadingPersonalListPromise: undefined,
    loadingCuratedListPromise: undefined,
    personalList: undefined,
    curatedList: undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<RadarStoreState, ActionType, GetterType, MutationType>;
