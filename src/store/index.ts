import Vue from 'vue';
import Vuex from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { Theme } from '@/settings/theme';

import actions from './actions';
import account from './modules/account';
import debitCard from './modules/debit-card';
import governance from './modules/governance';
import modals from './modules/modals';
import nft from './modules/nft';
import savings from './modules/savings';
import savingsPlus from './modules/savings-plus';
import shop from './modules/shop';
import treasury from './modules/treasury';
import mutations from './mutations';
import { RootStoreState } from './types';

Vue.use(Vuex);

const store = new Vuex.Store<RootStoreState>({
  strict: false, // should never be true as recursion level is too deep
  state: {
    i18n: null,
    isThemeInitialized: false,
    theme: Theme.Light,
    colors: {}
  },
  actions: actions,
  mutations: mutations,
  modules: {
    savingsPlus,
    savings,
    treasury,
    account,
    modals,
    governance,
    nft
  }
});

if (isFeatureEnabled('isNibbleShopEnabled')) {
  store.registerModule('shop', shop);
}

if (isFeatureEnabled('isDebitCardEnabled')) {
  store.registerModule('debitCard', debitCard);
}

export default store;
