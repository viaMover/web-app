import { GetterTree } from 'vuex';

import gt from 'lodash-es/gt';

import { RootStoreState } from '@/store/types';
import { divide, multiply } from '@/utils/bigmath';

import { EarningsOlympusStoreState } from './types';

export default {
  balanceNative(state): string {
    if (!state.olympusBalance) {
      return '0';
    }

    return state.olympusBalance;
  },
  apyNative(state): string {
    if (!state.olympusAPY) {
      return '0';
    }
    return multiply(divide(state.olympusAPY, '100'), '10000');
  },
  hasActiveEarnings(state): boolean {
    if (state.olympusBalance !== undefined && gt(state.olympusBalance, 0)) {
      return true;
    }
    return false;
  }
} as GetterTree<EarningsOlympusStoreState, RootStoreState>;
