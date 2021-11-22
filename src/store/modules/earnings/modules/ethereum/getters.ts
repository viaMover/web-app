import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { divide, multiply } from '@/utils/bigmath';

import { EarningsEthereumStoreState } from './types';

export default {
  balanceNative(): string {
    return '0';
  },
  apyNative(state): string {
    if (!state.ethereumAPY) {
      return '0';
    }
    return multiply(divide(state.ethereumAPY, '100'), '10000');
  },
  hasActiveEarnings(): boolean {
    return false;
  }
} as GetterTree<EarningsEthereumStoreState, RootStoreState>;
