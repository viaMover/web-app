import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsEthereumStoreState } from './types';

export default {
  async loadMinimalInfo(): Promise<void> {
    Promise.resolve();
  },
  async loadInfo(): Promise<void> {
    Promise.resolve();
  }
} as ActionTree<EarningsEthereumStoreState, RootStoreState>;
