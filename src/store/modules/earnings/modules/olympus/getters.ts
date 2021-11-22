import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { divide, multiply } from '@/utils/bigmath';

import { EarningsOlympusStoreState } from './types';

export default {
  balanceNative(): string {
    return '0';
  },
  apyNative(state): string {
    if (!state.olympusAPY) {
      return '0';
    }
    return multiply(divide(state.olympusAPY, '100'), '10000');
  },
  hasActiveEarnings(): boolean {
    return false;
  }
} as GetterTree<EarningsOlympusStoreState, RootStoreState>;
