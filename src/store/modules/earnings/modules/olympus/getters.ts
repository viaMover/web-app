import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsOlympusStoreState } from './types';

export default {
  balanceNative(): string {
    return '0';
  },
  apyNative(): string {
    return '0';
  },
  hasActiveEarnings(): boolean {
    return true;
  }
} as GetterTree<EarningsOlympusStoreState, RootStoreState>;
