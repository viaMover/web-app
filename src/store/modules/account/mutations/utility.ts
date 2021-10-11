import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { AccountStoreState } from '../types';

export default {
  toggleIsDebitCardSectionVisible(state): void {
    state.isDebitCardSectionVisible = !state.isDebitCardSectionVisible;
  },
  toggleIsDepositCardSectionVisible(state): void {
    state.isDepositCardSectionVisible = !state.isDepositCardSectionVisible;
  }
} as GetterTree<AccountStoreState, RootStoreState>;
