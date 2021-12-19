import { Module, Store } from 'vuex';

import { isFeatureEnabled, isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import getters from './getters';
import ethereum from './modules/ethereum';
import olympus from './modules/olympus';
import mutations from './mutations';
import { EarningsProviderName, EarningsStoreState } from './types';

export const earningsModule = {
  namespaced: true,
  strict: !isProduction(),
  state: {},
  actions,
  getters,
  mutations
} as Module<EarningsStoreState, RootStoreState>;

export const registerNestedModules = (store: Store<RootStoreState>): void => {
  if (isFeatureEnabled('isEarningsEthereumEnabled')) {
    store.registerModule(['earnings', EarningsProviderName.Ethereum], ethereum);
  }

  if (isFeatureEnabled('isEarningsOlympusEnabled')) {
    store.registerModule(['earnings', EarningsProviderName.Olympus], olympus);
  }
};

export default earningsModule;
