import Vue from 'vue';
import Vuex from 'vuex';

import { getPreferredTheme, Theme } from '@/settings/theme';

import actions from './actions';
import account from './modules/account';
import debitCard from './modules/debit-card';
import governance from './modules/governance';
import modals from './modules/modals';
import nft from './modules/nft';
import savings from './modules/savings';
import shop from './modules/shop';
import stakingUBT from './modules/staking-ubt';
import treasury from './modules/treasury';
import mutations from './mutations';
import { RootStoreState } from './types';

Vue.use(Vuex);

const store = new Vuex.Store<RootStoreState>({
  strict: false, // should never be true as recursion level is too deep
  state: {
    i18n: null,
    isThemeInitialized: false,
    preferredTheme: Theme.System,
    theme: getPreferredTheme(),
    colors: {}
  },
  actions: actions,
  mutations: mutations,
  modules: {
    savings,
    treasury,
    account,
    modals,
    governance,
    nft,
    stakingUBT,
    shop,
    debitCard
  }
});
export default store;
