import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { TagStoreState } from './types';

const initialState: TagStoreState = {
  isLoading: false,
  isBannerVisible: true,

  tag: undefined,
  apiService: undefined
};

export default {
  namespaced: true,
  strict: !isProduction(),
  state: () => initialState,
  actions,
  getters,
  mutations
} as AugmentedModule<TagStoreState, ActionType, GetterType, MutationType>;
