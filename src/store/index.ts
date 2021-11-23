import Vue from 'vue';
import Vuex from 'vuex';

import { isFeatureEnabled } from '@/settings';

import actions from './actions';
import account from './modules/account';
import governance from './modules/governance';
import modals from './modules/modals';
import nft from './modules/nft';
import radar from './modules/radar';
import shop from './modules/shop';
import mutations from './mutations';
import { RootStoreState } from './types';

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
    modals,
    governance
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

export default store;
