import { Store } from 'vuex';

import { isFeatureEnabled, isProduction } from '@/settings';
import { AugmentedModule, RootStoreState } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import ethereum from './modules/ethereum';
import olympus from './modules/olympus';
import mutations, { MutationType } from './mutations';
import { EarningsProviderName, EarningsStoreState } from './types';

export const earningsModule = {
  namespaced: true,
  strict: !isProduction(),
  state: {},
  actions,
  getters,
  mutations
} as AugmentedModule<EarningsStoreState, ActionType, GetterType, MutationType>;

export const registerNestedModules = (store: Store<RootStoreState>): void => {
  if (isFeatureEnabled('isEarningsEthereumEnabled')) {
    store.registerModule(['earnings', EarningsProviderName.Ethereum], ethereum);
  }

  if (isFeatureEnabled('isEarningsOlympusEnabled')) {
    store.registerModule(['earnings', EarningsProviderName.Olympus], olympus);
  }
};

export default earningsModule;
