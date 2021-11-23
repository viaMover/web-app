import Vue from 'vue';
import Vuex from 'vuex';

import { isFeatureEnabled } from '@/settings';

import actions from './actions';
import account from './modules/account';
import debitCard from './modules/debit-card';
import governance from './modules/governance';
import modals from './modules/modals';
import nft from './modules/nft';
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
    governance,
    nft
  }
});

if (isFeatureEnabled('isNibbleShopEnabled')) {
  import(/* webpackChunkName: "nibble-shop-store" */ './modules/shop').then(
    (module) => store.registerModule('shop', module.default)
  );
}

if (isFeatureEnabled('isReleaseRadarEnabled')) {
  import(/* webpackChunkName: "release-radar-store" */ './modules/radar').then(
    (module) => store.registerModule('radar', module.default)
  );
}

if (isFeatureEnabled('isDebitCardEnabled')) {
  store.registerModule('debitCard', debitCard);
}

export default store;
