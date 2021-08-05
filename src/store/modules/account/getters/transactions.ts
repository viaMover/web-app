import { Transaction } from '@/wallet/types';
import { GetterTree } from 'vuex';

import { AccountStoreState } from '../types';
import { RootStoreState } from '@/store/types';

export default {
  getPendingTransactions(state): Transaction[] {
    return state.transactions.filter((t) => t.status === 'pending');
  },
  getPendingOffchainTransactions(state): Transaction[] {
    return state.transactions.filter(
      (t) => t.status === 'pending' && t.isOffchain === true
    );
  }
} as GetterTree<AccountStoreState, RootStoreState>;
