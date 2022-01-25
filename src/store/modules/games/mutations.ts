import { GamesStoreState } from '@/store/modules/games/types';
import { MutationFuncs } from '@/store/types';

enum Mutations {
  setVaultsRaceAccounts,
  setIsLoading,
  rollDice
}

const mutations: MutationFuncs<typeof Mutations, GamesStoreState> = {
  setVaultsRaceAccounts(state, accounts): void {
    state.vaultsRaceAccounts = accounts;
  },
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  rollDice(state, address): void {
    const idx = state.vaultsRaceAccounts.findIndex(
      (item) => item.address === address
    );

    if (idx !== -1) {
      state.vaultsRaceAccounts[idx].allowRoll = false;
    }
  }
};

export type MutationType = typeof mutations;
export default mutations;
