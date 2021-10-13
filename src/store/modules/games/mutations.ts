import { MutationTree } from 'vuex';

import { GamesStoreState, VaultRaceAccount } from '@/store/modules/games/types';

export default {
  setVaultsRaceAccounts(state, accounts: Array<VaultRaceAccount>): void {
    state.vaultsRaceAccounts = accounts;
  },
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  rollDice(state, address: string): void {
    const idx = state.vaultsRaceAccounts.findIndex(
      (item) => item.address === address
    );

    if (idx !== -1) {
      state.vaultsRaceAccounts[idx].allowRoll = false;
    }
  }
} as MutationTree<GamesStoreState>;
