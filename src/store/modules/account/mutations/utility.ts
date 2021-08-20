import { GetterTree } from 'vuex';
import { AccountStoreState } from '../types';
import { RootStoreState } from '@/store/types';

export default {
  toggleIsDebitCardSectionVisible(state): void {
    state.isDebitCardSectionVisible = !state.isDebitCardSectionVisible;
  },
  toggleIsDepositCardSectionVisible(state): void {
    state.isDepositCardSectionVisible = !state.isDepositCardSectionVisible;
  }
} as GetterTree<AccountStoreState, RootStoreState>;
