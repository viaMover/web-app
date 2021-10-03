import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';

import account from './modules/account';
import shop from './modules/shop';
import nft from './modules/nft';
import governance from './modules/governance';
import radar from './modules/radar';
import modals from './modules/modals';
import { RootStoreState } from './types';
import { isFeatureEnabled } from '@/settings';

Vue.use(Vuex);

const store = new Vuex.Store<RootStoreState>({
  strict: false, // should never be true as recursion level is too deep
  state: {
    appVersion: '0.0.1',
    i18n: null
  },
  actions: actions,
  mutations: mutations,
  modules: {
    account,
    modals
  }
});

if (isFeatureEnabled('isNibbleShopEnabled')) {
  store.registerModule('shop', shop);
}

if (isFeatureEnabled('isNftDropsEnabled')) {
  store.registerModule('nft', nft);
}

if (isFeatureEnabled('isReleaseRadarEnabled')) {
  store.registerModule('radar', radar);
}

if (isFeatureEnabled('isGovernanceEnabled')) {
  store.registerModule('governance', governance);
}

export default store;
