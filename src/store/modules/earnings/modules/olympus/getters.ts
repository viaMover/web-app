import { GetterTree } from 'vuex';

import gt from 'lodash-es/gt';

import { SavingsMonthBalanceItem } from '@/services/mover';
import { OlympusMonthBalanceItem } from '@/services/mover/earnings/types';
import { RootStoreState } from '@/store/types';
import { divide, fromWei, multiply } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

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
    return true;
  },
  olympusInfoEarnedThisMonthNative(state, getters, rootState): string {
    if (
      state.olympusInfo === undefined ||
      state.isOlympusInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    const valueInUSDC = fromWei(
      state.olympusInfo.earnedThisMonth,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );

    return multiply(valueInUSDC, getters.usdcNativePrice);
  },
  olympusEarnedThisMonth(state, getters, rootState): string {
    if (
      state.isOlympusInfoLoading ||
      state.olympusInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      state.olympusInfo.earnedThisMonth === 0
    ) {
      return '0';
    }

    return fromWei(
      state.olympusInfo.earnedThisMonth,
      getUSDCAssetData(rootState.account?.networkInfo.network).decimals
    );
  },
  olympusEarnedThisMonthNative(state, getters, rootState, rootGetters): string {
    return multiply(
      getters.olympusEarnedThisMonth,
      rootGetters['account/usdcNativePrice']
    );
  },
  olympusMonthStatsOptions(state): Array<OlympusMonthBalanceItem> {
    if (state.isOlympusInfoLoading || state.olympusInfo === undefined) {
      return [];
    }

    let hasTrimmedLeft = false;
    return state.olympusInfo.last12MonthsBalances
      .reduce((acc, item) => {
        if (item.balance === 0 && !hasTrimmedLeft) {
          return acc;
        }

        hasTrimmedLeft = true;
        return [...acc, item];
      }, new Array<OlympusMonthBalanceItem>())
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  }
} as GetterTree<EarningsOlympusStoreState, RootStoreState>;
