import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsEthereumStoreState } from './types';

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
} as GetterTree<EarningsEthereumStoreState, RootStoreState>;
