import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { AccountStoreState } from './types';

export default {
  async setCurrentWallet({ commit }, address: string): Promise<void> {
    commit('setCurrentWallet', address);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
