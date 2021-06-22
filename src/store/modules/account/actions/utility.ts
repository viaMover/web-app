import { RootStoreState } from '@/store/types';
import { ActionTree } from 'vuex';
import { AccountStoreState } from '../types';

export default {
  toggleIsDebitCardSectionVisible({ commit }): void {
    commit('toggleIsDebitCardSectionVisible');
  }
} as ActionTree<AccountStoreState, RootStoreState>;
