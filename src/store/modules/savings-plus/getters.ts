import {
  SavingsPlusInfo,
  SavingsPlusMonthBalanceItem
} from '@/services/v2/api/mover/savings-plus';
import { unwrapCacheItem } from '@/store/modules/utils';
import { GettersFuncs } from '@/store/types';
import { divide, fromWei, greaterThan, multiply } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

import { SavingsPlusStoreState } from './types';

type Getters = {
  info: SavingsPlusInfo | undefined;
  usdcNativePrice: string;
  hasActiveSavingsPlus: boolean;
  balanceNative: string;
  infoBalanceUSDC: string;
  infoEarnedThisMonthNative: string;
  savingsMonthStatsOptions: Array<SavingsPlusMonthBalanceItem>;
  infoBalanceNative: string;
  infoEarnedTotalNative: string;
  infoTotalPoolBalanceNative: string;
  estimatedEarningsTomorrowNative: string;
  estimatedEarningsNextMonthNative: string;
  estimatedEarningsAnnuallyNative: string;
};

const getters: GettersFuncs<Getters, SavingsPlusStoreState> = {
  info(state): SavingsPlusInfo | undefined {
    return unwrapCacheItem(state.info);
  },
  usdcNativePrice(state, getters, _, rootGetters): string {
    return rootGetters['account/usdcNativePrice'];
  },
  hasActiveSavingsPlus(state, getters): boolean {
    if (state.balance !== undefined && greaterThan(state.balance, 0)) {
      return true;
    }

    if (getters.info !== undefined && !state.isInfoLoading) {
      const isCurrentBalanceNotEmpty = getters.info.currentBalance > 0;
      const isEarnedTotalNotEmpty = getters.info.earnedTotal > 0;

      if (isCurrentBalanceNotEmpty || isEarnedTotalNotEmpty) {
        return true;
      }

      const hadAtLeastOneMonthWithNonZeroBalance =
        getters.info.last12MonthsBalances.some((item) => item.balance > 0);
      if (hadAtLeastOneMonthWithNonZeroBalance) {
        return true;
      }
    }

    return false;
  },
  balanceNative(state, getters): string {
    if (state.balance === undefined) {
      return '0';
    }
    return multiply(state.balance, getters.usdcNativePrice);
  },
  infoBalanceUSDC(state, getters, rootState): string {
    if (state.balance !== undefined) {
      return state.balance;
    }

    if (
      getters.info === undefined ||
      state.isInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      getters.info.currentBalance,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  savingsMonthStatsOptions(state, getters): Array<SavingsPlusMonthBalanceItem> {
    if (getters.info === undefined) {
      return [];
    }

    let hasTrimmedLeft = false;
    const result = getters.info.last12MonthsBalances
      .reduce((acc, item) => {
        if (item.balance === 0 && !hasTrimmedLeft) {
          return acc;
        }

        hasTrimmedLeft = true;
        return [...acc, item];
      }, new Array<SavingsPlusMonthBalanceItem>())
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);

    if (result.length === 0 && getters.info.last12MonthsBalances.length > 0) {
      return [
        getters.info.last12MonthsBalances[
          getters.info.last12MonthsBalances.length - 1
        ]
      ];
    }

    return result;
  },
  infoEarnedThisMonthNative(state, getters, rootState): string {
    if (
      getters.info === undefined ||
      state.isInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    const valueInUSDC = fromWei(
      getters.info.earnedThisMonth,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );

    return multiply(valueInUSDC, getters.usdcNativePrice);
  },
  infoBalanceNative(state, getters): string {
    return multiply(getters.infoBalanceUSDC, getters.usdcNativePrice);
  },
  infoEarnedTotalNative(state, getters, rootState): string {
    if (
      getters.info === undefined ||
      state.isInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      getters.info.earnedTotal,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  infoTotalPoolBalanceNative(state, getters, rootState): string {
    if (
      getters.info === undefined ||
      state.isInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    const balanceUSDC = fromWei(
      getters.info.currentPoolBalance,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
    return multiply(balanceUSDC, getters.usdcNativePrice);
  },
  estimatedEarningsTomorrowNative(state, getters): string {
    if (
      getters.info === undefined ||
      state.isInfoLoading ||
      state.DPY === undefined
    ) {
      return '0';
    }

    const multiplier = divide(state.DPY, 100);
    return multiply(getters.balanceNative, multiplier);
  },
  estimatedEarningsNextMonthNative(state, getters): string {
    if (
      state.info === undefined ||
      state.isInfoLoading ||
      state.DPY === undefined
    ) {
      return '0';
    }

    const multiplier = divide(multiply(state.DPY, 30), 100);
    return multiply(getters.balanceNative, multiplier);
  },
  estimatedEarningsAnnuallyNative(state, getters): string {
    if (state.APY === undefined) {
      return '0';
    }

    const multiplier = divide(state.APY, 100);
    return multiply(getters.balanceNative, multiplier);
  }
};

export type GetterType = typeof getters;
export default getters;
