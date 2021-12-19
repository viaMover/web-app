import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsStoreState } from './types';

export default {
  earningsBalanceNative(): string {
    return '0';
  }
} as GetterTree<EarningsStoreState, RootStoreState>;
