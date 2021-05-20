import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { AccountStoreState, AccountData } from './types';

export default {
  async setCurrentWallet({ commit }, address: string): Promise<void> {
    commit('setCurrentWallet', address);
  },

  clearProvider({ commit, state }): void {
    if (state.providerBeforeClose) {
      state.providerBeforeClose();
    }
    commit('setAccountData', {
      addresses: [] as Array<string>,
      web3Inst: null,
      balance: null,
      networkId: null
    } as AccountData);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
