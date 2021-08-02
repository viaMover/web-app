import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';

import account from './modules/account';
import shop from './modules/shop';
import nft from './modules/nft';
import proposal from './modules/proposal';
import radar from './modules/radar';
import { RootStoreState } from './types';

Vue.use(Vuex);

export default new Vuex.Store<RootStoreState>({
  state: {
    appVersion: '0.0.1',
    i18n: null
  },
  actions: actions,
  mutations: mutations,
  modules: {
    account,
    shop,
    nft,
    proposal,
    radar
  }
});
