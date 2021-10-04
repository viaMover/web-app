import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import account from './modules/account';
import modals from './modules/modals';
import nft from './modules/nft';
import proposal from './modules/proposal';
import radar from './modules/radar';
import shop from './modules/shop';
import mutations from './mutations';
import { RootStoreState } from './types';

Vue.use(Vuex);

export default new Vuex.Store<RootStoreState>({
  strict: false,
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
    radar,
    modals
  }
});
