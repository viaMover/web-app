import Vue from 'vue';
import Vuex from 'vuex';

import { isFeatureEnabled } from '@/settings';

import actions from './actions';
import account from './modules/account';
import debitCard from './modules/debit-card';
import modals from './modules/modals';
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
    debitCard
  }
});

if (isFeatureEnabled('isNibbleShopEnabled')) {
  import(/* webpackChunkName: "nibble-shop-store" */ './modules/shop').then(
    (module) => store.registerModule('shop', module.default)
  );
}

if (isFeatureEnabled('isNftDropsEnabled')) {
  import(/* webpackChunkName: "nft-drops-store" */ './modules/nft').then(
    (module) => store.registerModule('nft', module.default)
  );
}

if (isFeatureEnabled('isReleaseRadarEnabled')) {
  import(/* webpackChunkName: "release-radar-store" */ './modules/radar').then(
    (module) => store.registerModule('radar', module.default)
  );
}

if (isFeatureEnabled('isGovernanceEnabled')) {
  import(
    /* webpackChunkName: "governance-store" */ './modules/governance'
  ).then((module) => store.registerModule('governance', module.default));
}

export default store;
