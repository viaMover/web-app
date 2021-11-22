import { GetterTree } from 'vuex';

import gt from 'lodash-es/gt';

import { RootStoreState } from '@/store/types';
import { divide, multiply } from '@/utils/bigmath';

import { EarningsEthereumStoreState } from './types';

export default {
  balanceNative(state): string {
    if (!state.ethereumBalance) {
      return '0';
    }

    return state.ethereumBalance;
  },
  apyNative(state): string {
    if (!state.ethereumAPY) {
      return '0';
    }
    return multiply(divide(state.ethereumAPY, '100'), '10000');
  },
  hasActiveEarnings(state): boolean {
    if (state.ethereumBalance !== undefined && gt(state.ethereumBalance, 0)) {
      return true;
    }

    return false;
  }
} as GetterTree<EarningsEthereumStoreState, RootStoreState>;
