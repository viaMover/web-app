import { Module } from 'vuex';
import { RootStoreState } from '@/store/types';
import { GamesStoreState } from '@/store/modules/games/types';
import actions from '@/store/modules/games/actions';
import mutations from '@/store/modules/games/mutations';
import getters from '@/store/modules/games/getters';

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
