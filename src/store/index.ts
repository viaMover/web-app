import Vue from 'vue';
import Vuex from 'vuex';

import { getPreferredTheme, Theme } from '@/settings/theme';

import actions from './actions';
import account, {
  initialState as accountInitialState
} from './modules/account';
import debitCard, {
  initialState as debitCardInitialState
} from './modules/debit-card';
import governance, {
  initialState as governanceInitialState
} from './modules/governance';
import modals, { initialState as modalsInitialState } from './modules/modals';
import nft, { initialState as nftInitialState } from './modules/nft';
import savings, {
  initialState as savingsInitialState
} from './modules/savings';
import savingsPlus, {
  initialState as savingsPlusInitialState
} from './modules/savings-plus';
import shop, { initialState as shopInitialState } from './modules/shop';
import stakingUBT, {
  initialState as stakingUBTInitialState
} from './modules/staking-ubt';
import treasury, {
  initialState as treasuryInitialState
} from './modules/treasury';
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
    colors: {},
    account: accountInitialState,
    savings: savingsInitialState,
    treasury: treasuryInitialState,
    savingsPlus: savingsPlusInitialState,
    modals: modalsInitialState,
    governance: governanceInitialState,
    nft: nftInitialState,
    stakingUBT: stakingUBTInitialState,
    shop: shopInitialState,
    debitCard: debitCardInitialState
  },
  actions: actions,
  mutations: mutations,
  modules: {
    account,
    savings,
    treasury,
    savingsPlus,
    modals,
    governance,
    nft,
    stakingUBT,
    shop,
    debitCard
  }
});
export default store;
