import { GamesStoreState, VaultRaceAccount } from '@/store/modules/games/types';
import { GettersFuncs } from '@/store/types';

type Getters = {
  vaultsRaceAccounts: Array<VaultRaceAccount>;
  vaultsRaceAccountsCount: number;
  vaultsRaceAccount: (address: string) => VaultRaceAccount | undefined;
  leaderVaultsRaceAccount: VaultRaceAccount | undefined;
};

const getters: GettersFuncs<Getters, GamesStoreState> = {
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
};

export type GetterType = typeof getters;
export default getters;
