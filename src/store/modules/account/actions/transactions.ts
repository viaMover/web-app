import { ActionTree } from 'vuex';

import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import { Transaction } from '@/wallet/types';

export default {
  addTransaction({ commit }, transaction: Transaction): void {
    commit('addTransaction', transaction);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
