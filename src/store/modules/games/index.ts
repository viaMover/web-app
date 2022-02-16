import { isProduction } from '@/settings/globals';
import { GamesStoreState } from '@/store/modules/games/types';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';

export default {
  namespaced: true,
  strict: !isProduction,
  state: {
    isLoading: false,

    vaultsRaceAccounts: []
  },
  actions,
  mutations,
  getters
} as AugmentedModule<GamesStoreState, ActionType, GetterType, MutationType>;
