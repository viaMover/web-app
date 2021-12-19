import Vue from 'vue';
import Vuex from 'vuex';

import { isFeatureEnabled } from '@/settings';

import actions from './actions';
import account from './modules/account';
import debitCard from './modules/debit-card';
import {
  earningsModule as earnings,
  registerNestedModules as earningsRegisterNestedModules
} from './modules/earnings';
import games from './modules/games';
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
    governance,
    nft
  }
});

if (isFeatureEnabled('isNibbleShopEnabled')) {
  store.registerModule('shop', shop);
}

if (isFeatureEnabled('isReleaseRadarEnabled')) {
  store.registerModule('radar', radar);
}

if (isFeatureEnabled('isEarningsEnabled')) {
  store.registerModule('earnings', earnings);
  earningsRegisterNestedModules(store);
}

if (isFeatureEnabled('isDebitCardEnabled')) {
  store.registerModule('debitCard', debitCard);
}

if (isFeatureEnabled('isVaultsRaceEnabled')) {
  store.registerModule('games', games);
}

export default store;
