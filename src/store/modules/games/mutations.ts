import { MutationTree } from 'vuex';
import { GamesStoreState } from '@/store/modules/games/types';

export default {
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
} as MutationTree<GamesStoreState>;
