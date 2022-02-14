import {
  SavingsInfo,
  SavingsMonthBalanceItem,
  SavingsReceipt
} from '@/services/mover';
import { GettersFuncs } from '@/store/types';
import { divide, fromWei, greaterThan, multiply } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

import { SavingsStoreState } from './types';

type Getters = {
  savingsInfo: SavingsInfo | undefined;
  savingsBalanceNative: string;
  savingsInfoBalanceUSDC: string;
  savingsInfoBalanceNative: string;
  savingsInfoEarnedThisMonthNative: string;
  savingsInfoEarnedTotalNative: string;
  savingsInfoTotalPoolBalanceNative: string;
  savingsEstimatedEarningsTomorrowNative: string;
  savingsEstimatedEarningsNextMonthNative: string;
  savingsEstimatedEarningsAnnuallyNative: string;
  savingsMonthStatsOptions: Array<SavingsMonthBalanceItem>;
  hasActiveSavings: boolean;
  savingsAvg30DaysAPY: string;
  savingsReceipt: (y: number, m: number) => Promise<SavingsReceipt> | undefined;
  usdcNativePrice: string;
};

const getters: GettersFuncs<Getters, SavingsStoreState> = {
  savingsInfo(state): SavingsInfo | undefined {
    if (state.savingsInfo === undefined) {
      return undefined;
    }

    if (state.savingsInfo.expDate > Date.now()) {
      return state.savingsInfo.data;
    }

    return undefined;
  },
  savingsBalanceNative(state, getters): string {
    if (state.savingsBalance === undefined) {
      return '0';
    }
    return multiply(state.savingsBalance, getters.usdcNativePrice);
  },
  savingsInfoBalanceUSDC(state, getters, rootState): string {
    if (state.savingsBalance !== undefined) {
      return state.savingsBalance;
    }

    if (
      getters.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      getters.savingsInfo.currentBalance,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  savingsInfoBalanceNative(state, getters): string {
    return multiply(getters.savingsInfoBalanceUSDC, getters.usdcNativePrice);
  },
  savingsInfoEarnedThisMonthNative(state, getters, rootState): string {
    if (
      getters.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    const valueInUSDC = fromWei(
      getters.savingsInfo.earnedThisMonth,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );

    return multiply(valueInUSDC, getters.usdcNativePrice);
  },
  savingsInfoEarnedTotalNative(state, getters, rootState): string {
    if (
      getters.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      getters.savingsInfo.earnedTotal,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  savingsInfoTotalPoolBalanceNative(state, getters, rootState): string {
    if (
      getters.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    const balanceUSDC = fromWei(
      getters.savingsInfo.currentPoolBalance,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
    return multiply(balanceUSDC, getters.usdcNativePrice);
  },
  savingsEstimatedEarningsTomorrowNative(state, getters): string {
    if (
      getters.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      state.savingsDPY === undefined
    ) {
      return '0';
    }

    const multiplier = divide(state.savingsDPY, 100);
    return multiply(getters.savingsInfoBalanceNative, multiplier);
  },
  savingsEstimatedEarningsNextMonthNative(state, getters): string {
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      state.savingsDPY === undefined
    ) {
      return '0';
    }

    const multiplier = divide(multiply(state.savingsDPY, 30), 100);
    return multiply(getters.savingsInfoBalanceNative, multiplier);
  },
  savingsEstimatedEarningsAnnuallyNative(state, getters): string {
    if (state.savingsAPY === undefined) {
      return '0';
    }

    const multiplier = divide(state.savingsAPY, 100);
    return multiply(getters.savingsInfoBalanceNative, multiplier);
  },
  savingsMonthStatsOptions(state, getters): Array<SavingsMonthBalanceItem> {
    if (state.isSavingsInfoLoading || getters.savingsInfo === undefined) {
      return [];
    }

    let hasTrimmedLeft = false;
    return getters.savingsInfo.last12MonthsBalances
      .reduce((acc, item) => {
        if (item.balance === 0 && !hasTrimmedLeft) {
          return acc;
        }

        hasTrimmedLeft = true;
        return [...acc, item];
      }, new Array<SavingsMonthBalanceItem>())
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  },
  hasActiveSavings(state, getters): boolean {
    if (
      state.savingsBalance !== undefined &&
      greaterThan(state.savingsBalance, 0)
    ) {
      return true;
    }

    if (getters.savingsInfo !== undefined && !state.isSavingsInfoLoading) {
      const isCurrentBalanceNotEmpty = getters.savingsInfo.currentBalance > 0;
      const isEarnedTotalNotEmpty = getters.savingsInfo.earnedTotal > 0;

      if (isCurrentBalanceNotEmpty || isEarnedTotalNotEmpty) {
        return true;
      }

      const hadAtLeastOneMonthWithNonZeroBalance =
        getters.savingsInfo.last12MonthsBalances.some(
          (item) => item.balance > 0
        );
      if (hadAtLeastOneMonthWithNonZeroBalance) {
        return true;
      }
    }

    return false;
  },
  savingsAvg30DaysAPY(state, getters): string {
    if (getters.savingsInfo === undefined || state.isSavingsInfoLoading) {
      return '0';
    }

    return multiply(getters.savingsInfo.avg30DaysAPY, 100);
  },
  usdcNativePrice(state, getters, _, rootGetters): string {
    return rootGetters['account/usdcNativePrice'];
  },
  savingsReceipt(
    state
  ): (year: number, month: number) => Promise<SavingsReceipt> | undefined {
    return (year, month): Promise<SavingsReceipt> | undefined => {
      const item = state.receipts.get(`${year}/${month}`);
      if (item !== undefined && item.expDate > Date.now()) {
        return item.data;
      }
      return undefined;
    };
  }
};

export type GetterType = typeof getters;
export default getters;
