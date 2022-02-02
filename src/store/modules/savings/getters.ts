import gt from 'lodash-es/gt';

import { SavingsMonthBalanceItem, SavingsReceipt } from '@/services/mover';
import { GettersFuncs } from '@/store/types';
import { divide, fromWei, multiply } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

import { SavingsStoreState } from './types';

type Getters = {
  savingsInfoBalanceUSDC: string;
  savingsInfoBalanceNative: string;
  savingsInfoEarnedThisMonthNative: string;
  savingsInfoEarnedTotalNative: string;
  savingsInfoTotalPoolBalanceNative: string;
  savingsEstimatedEarningsTomorrowNative: string;
  savingsEstimatedEarningsNextMonthNative: string;
  savingsEstimatedEarningsAnnuallyNative: string;
  // savingsEndOfMonthBalanceNative: string;
  // savingsMonthEarnedNative: string;
  // savingsMonthAverageEarnedNative: string;
  // savingsMonthTotalDepositsNative: string;
  // savingsMonthTotalWithdrawalsNative: string;
  savingsMonthStatsOptions: Array<SavingsMonthBalanceItem>;
  hasActiveSavings: boolean;
  savingsAvg30DaysAPY: string;
  // savingsMonthPaidToTreasury: string;
  // savingsMonthPaidToTreasuryNative: string;
  // savingsMonthSavedFees: string;
  // savingsMonthSavedFeesNative: string;
  savingsReceipt: (y: number, m: number) => Promise<SavingsReceipt> | undefined;
  usdcNativePrice: string;
};

const getters: GettersFuncs<Getters, SavingsStoreState> = {
  savingsInfoBalanceUSDC(state, _, rootState): string {
    if (state.savingsBalance !== undefined) {
      return state.savingsBalance;
    }

    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account!.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      state.savingsInfo.currentBalance,
      getUSDCAssetData(rootState.account!.networkInfo.network).decimals
    );
  },
  savingsInfoBalanceNative(state, getters, _): string {
    return multiply(getters.savingsInfoBalanceUSDC, getters.usdcNativePrice);
  },
  savingsInfoEarnedThisMonthNative(state, getters, rootState): string {
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account!.networkInfo === undefined
    ) {
      return '0';
    }

    const valueInUSDC = fromWei(
      state.savingsInfo.earnedThisMonth,
      getUSDCAssetData(rootState.account!.networkInfo.network).decimals
    );

    return multiply(valueInUSDC, getters.usdcNativePrice);
  },
  savingsInfoEarnedTotalNative(state, _, rootState): string {
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account!.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      state.savingsInfo.earnedTotal,
      getUSDCAssetData(rootState.account!.networkInfo.network).decimals
    );
  },
  savingsInfoTotalPoolBalanceNative(state, getters, rootState): string {
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      rootState.account!.networkInfo === undefined
    ) {
      return '0';
    }

    const balanceUSDC = fromWei(
      state.savingsInfo.currentPoolBalance,
      getUSDCAssetData(rootState.account!.networkInfo.network).decimals
    );
    return multiply(balanceUSDC, getters.usdcNativePrice);
  },
  savingsEstimatedEarningsTomorrowNative(state, getters): string {
    if (
      state.savingsInfo === undefined ||
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
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      state.savingsAPY === undefined
    ) {
      return '0';
    }

    const multiplier = divide(state.savingsAPY, 100);
    return multiply(getters.savingsInfoBalanceNative, multiplier);
  },
  // savingsEndOfMonthBalanceNative(state, getters, rootState): string {
  //   if (
  //     state.savingsReceipt === undefined ||
  //     state.isSavingsReceiptLoading ||
  //     rootState.account!.networkInfo === undefined ||
  //     state.savingsReceipt.endOfMonthBalance === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   const balanceInUSDC = fromWei(
  //     state.savingsReceipt.endOfMonthBalance,
  //     getUSDCAssetData(rootState.account!.networkInfo.network).decimals
  //   );
  //
  //   return multiply(balanceInUSDC, getters.usdcNativePrice);
  // },
  // savingsMonthEarnedNative(state, getters, rootState): string {
  //   if (
  //     state.savingsReceipt === undefined ||
  //     state.isSavingsReceiptLoading ||
  //     rootState.account!.networkInfo === undefined ||
  //     state.savingsReceipt.earnedThisMonth === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   const earnedInUSDC = fromWei(
  //     state.savingsReceipt.earnedThisMonth,
  //     getUSDCAssetData(rootState.account!.networkInfo.network).decimals
  //   );
  //   return multiply(earnedInUSDC, getters.usdcNativePrice);
  // },
  // savingsMonthAverageEarnedNative(state, getters, rootState): string {
  //   if (
  //     state.savingsReceipt === undefined ||
  //     state.isSavingsReceiptLoading ||
  //     rootState.account!.networkInfo === undefined ||
  //     state.savingsReceipt.avgDailyEarnings === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   const earnedInUSDC = fromWei(
  //     state.savingsReceipt.avgDailyEarnings,
  //     getUSDCAssetData(rootState.account!.networkInfo.network).decimals
  //   );
  //   return multiply(earnedInUSDC, getters.usdcNativePrice);
  // },
  // savingsMonthTotalDepositsNative(state, getters, rootState): string {
  //   if (
  //     state.savingsReceipt === undefined ||
  //     state.isSavingsReceiptLoading ||
  //     rootState.account!.networkInfo === undefined ||
  //     state.savingsReceipt.totalDeposits === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   const depositsInUSDC = fromWei(
  //     state.savingsReceipt.totalDeposits,
  //     getUSDCAssetData(rootState.account!.networkInfo.network).decimals
  //   );
  //
  //   return multiply(depositsInUSDC, getters.usdcNativePrice);
  // },
  // savingsMonthTotalWithdrawalsNative(state, _, rootState): string {
  //   if (
  //     state.savingsReceipt === undefined ||
  //     state.isSavingsReceiptLoading ||
  //     rootState.account!.networkInfo === undefined ||
  //     state.savingsReceipt.totalWithdrawals === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   const withdrawalsInUSDC = fromWei(
  //     state.savingsReceipt.totalWithdrawals,
  //     getUSDCAssetData(rootState.account!.networkInfo.network).decimals
  //   );
  //
  //   return multiply(withdrawalsInUSDC, getters.usdcNativePrice);
  // },
  savingsMonthStatsOptions(state): Array<SavingsMonthBalanceItem> {
    if (state.isSavingsInfoLoading || state.savingsInfo === undefined) {
      return [];
    }

    let hasTrimmedLeft = false;
    return state.savingsInfo.last12MonthsBalances
      .reduce((acc, item) => {
        if (item.balance === 0 && !hasTrimmedLeft) {
          return acc;
        }

        hasTrimmedLeft = true;
        return [...acc, item];
      }, new Array<SavingsMonthBalanceItem>())
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  },
  hasActiveSavings(state): boolean {
    if (state.savingsBalance !== undefined && gt(state.savingsBalance, 0)) {
      return true;
    }

    if (state.savingsInfo !== undefined && !state.isSavingsInfoLoading) {
      const isCurrentBalanceNotEmpty = state.savingsInfo.currentBalance > 0;
      const isEarnedTotalNotEmpty = state.savingsInfo.earnedTotal > 0;

      if (isCurrentBalanceNotEmpty || isEarnedTotalNotEmpty) {
        return true;
      }

      const hadAtLeastOneMonthWithNonZeroBalance =
        state.savingsInfo.last12MonthsBalances.some((item) => item.balance > 0);
      if (hadAtLeastOneMonthWithNonZeroBalance) {
        return true;
      }
    }

    // if (state.savingsReceipt !== undefined && !state.isSavingsReceiptLoading) {
    //   const isEndOfMonthBalanceNotEmpty =
    //     state.savingsReceipt.endOfMonthBalance > 0;
    //   const isTotalDepositsNotEmpty = state.savingsReceipt.totalDeposits > 0;
    //   const isTotalWithdrawalsNotEmpty =
    //     state.savingsReceipt.totalWithdrawals > 0;
    //
    //   if (
    //     isEndOfMonthBalanceNotEmpty ||
    //     isTotalDepositsNotEmpty ||
    //     isTotalWithdrawalsNotEmpty
    //   ) {
    //     return true;
    //   }
    // }

    return false;
  },
  savingsAvg30DaysAPY(state): string {
    if (state.savingsInfo === undefined || state.isSavingsInfoLoading) {
      return '0';
    }

    return multiply(state.savingsInfo.avg30DaysAPY, 100);
  },
  // savingsMonthPaidToTreasury(state, _, rootState): string {
  //   if (
  //     state.savingsReceipt === undefined ||
  //     state.isSavingsReceiptLoading ||
  //     rootState.account!.networkInfo === undefined ||
  //     state.savingsReceipt.paidToTreasury === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   return fromWei(
  //     state.savingsReceipt.paidToTreasury,
  //     getUSDCAssetData(rootState.account!.networkInfo.network).decimals
  //   );
  // },
  // savingsMonthPaidToTreasuryNative(state, getters, _): string {
  //   return multiply(
  //     getters.savingsMonthPaidToTreasury,
  //     getters.usdcNativePrice
  //   );
  // },
  // savingsMonthSavedFees(state, _, rootState): string {
  //   if (
  //     state.savingsReceipt === undefined ||
  //     state.isSavingsReceiptLoading ||
  //     rootState.account!.networkInfo === undefined ||
  //     state.savingsReceipt.savedFees === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   return fromWei(
  //     state.savingsReceipt.savedFees,
  //     getUSDCAssetData(rootState.account!.networkInfo.network).decimals
  //   );
  // },
  // savingsMonthSavedFeesNative(state, getters, _): string {
  //   return multiply(getters.savingsMonthSavedFees, getters.usdcNativePrice);
  // },
  usdcNativePrice(state, getters, _, rootGetters): string {
    return rootGetters['account/usdcNativePrice'];
  },
  savingsReceipt(
    state
  ): (year: number, month: number) => Promise<SavingsReceipt> | undefined {
    return (year, month): Promise<SavingsReceipt> | undefined => {
      const item = state.receipts[`${year}/${month}`];
      if (item !== undefined && item.expDate > Date.now()) {
        return item.data;
      } else {
        return undefined;
      }
    };
  }
};

export type GetterType = typeof getters;
export default getters;
