import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { Transaction } from '@/wallet/types';

import { AccountStoreState } from '../types';

export default {
  getPendingTransactions(state): Transaction[] {
    return state.transactions.filter((t) => t.status === 'pending');
  },
  getPendingOffchainTransactions(state): Transaction[] {
    return state.transactions.filter(
      (t) => t.status === 'pending' && t.isOffchain === true
    );
  },
  getTransactionByHash(state): (hash: string) => Transaction | undefined {
    return (hash: string): Transaction | undefined => {
      return state.transactions.find((t) => t.hash === hash);
    };
  },
  getTransactionByQueueId(state): (queueId: string) => Transaction | undefined {
    return (queueId: string): Transaction | undefined => {
      return state.transactions.find((t) => t.subsidizedQueueId === queueId);
    };
  }
} as GetterTree<AccountStoreState, RootStoreState>;
