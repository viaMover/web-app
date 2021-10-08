import { Module } from 'vuex';

import actions from '@/store/modules/games/actions';
import getters from '@/store/modules/games/getters';
import mutations from '@/store/modules/games/mutations';
import { GamesStoreState } from '@/store/modules/games/types';
import { RootStoreState } from '@/store/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    isLoading: false,

    vaultsRaceAccounts: []
  },
  actions,
  mutations,
  getters
} as Module<GamesStoreState, RootStoreState>;
