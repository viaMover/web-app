import { GamesStoreState, VaultRaceAccount } from '@/store/modules/games/types';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';

type Actions = {
  init: Promise<void>;
  rollDice: void;
};

const actions: ActionFuncs<Actions, GamesStoreState, MutationType, GetterType> =
  {
    async init({ commit }): Promise<void> {
      commit('setIsLoading', true);
      const vrAccounts: Array<VaultRaceAccount> = [
        {
          address: '#18284885500001284',
          points: 114,
          allowRoll: true,
          position: 1184,
          score: 18
        },
        {
          address: '#18284885500001285',
          points: 100,
          allowRoll: true,
          position: 1184,
          score: 18
        },
        {
          address: '#18284885500001286',
          points: 45,
          allowRoll: false,
          position: 1184,
          score: 18
        },
        {
          address: '#18284885500001287',
          points: 4,
          allowRoll: false,
          position: 1184,
          score: 18
        }
      ];
      commit('setVaultsRaceAccounts', vrAccounts);
      commit('setIsLoading', false);
    },
    rollDice({ commit }, address: string): void {
      commit('setVaultsRaceAccounts', address);
    }
  };

export type ActionType = typeof actions;
export default actions;
