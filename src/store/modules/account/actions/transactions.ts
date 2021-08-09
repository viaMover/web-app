import { Transaction } from '@/wallet/types';
import { AccountStoreState } from '@/store/modules/account/types';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';

export default {
  addTransaction({ commit }, transaction: Transaction): void {
    commit('addTransaction', transaction);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
