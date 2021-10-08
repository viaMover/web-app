import { GetterTree } from 'vuex';

import { GamesStoreState, VaultRaceAccount } from '@/store/modules/games/types';
import { RootStoreState } from '@/store/types';

export default {
  vaultsRaceAccounts(state): Array<VaultRaceAccount> {
    if (state.vaultsRaceAccounts === undefined) {
      return [];
    }

    return state.vaultsRaceAccounts;
  },
  vaultsRaceAccountsCount(state): number {
    if (state.vaultsRaceAccounts === undefined) {
      return 0;
    }

    return state.vaultsRaceAccounts.length;
  },
  vaultsRaceAccount(state): (address: string) => VaultRaceAccount | undefined {
    return (address) => {
      if (state.vaultsRaceAccounts === undefined) {
        return undefined;
      }

      return state.vaultsRaceAccounts.find((item) => item.address === address);
    };
  },
  leaderVaultsRaceAccount(state): VaultRaceAccount | undefined {
    if (state.vaultsRaceAccounts === undefined) {
      return undefined;
    }

    return state.vaultsRaceAccounts[0];
  }
} as GetterTree<GamesStoreState, RootStoreState>;
