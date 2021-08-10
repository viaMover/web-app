import { RootStoreState } from '@/store/types';
import { ActionTree } from 'vuex';
import { AccountStoreState } from '../types';

export default {
  toggleIsDebitCardSectionVisible({ commit }): void {
    commit('toggleIsDebitCardSectionVisible');
  },
  toggleIsDepositCardSectionVisible({ commit }): void {
    commit('toggleIsDepositCardSectionVisible');
  }
} as ActionTree<AccountStoreState, RootStoreState>;
