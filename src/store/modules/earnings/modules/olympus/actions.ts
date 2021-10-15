import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsOlympusStoreState } from './types';

export default {
  async loadMinimalInfo(): Promise<void> {
    Promise.resolve();
  },
  async loadInfo(): Promise<void> {
    Promise.resolve();
  }
} as ActionTree<EarningsOlympusStoreState, RootStoreState>;
