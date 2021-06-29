import { GetterTree } from 'vuex';
import { AccountStoreState, TransactionGroup } from './types';
import { RootStoreState } from '@/store/types';
import dayjs from 'dayjs';
import { Transaction } from '@/wallet/types';
import { ChartData } from '@/components/charts';
import { fromWei } from '@/utils/bigmath';
import { MonthBalanceItem } from '@/services/mover/savings';
import { dateFromExplicitPair } from '@/utils/time';

export default {
  transactionsGroupedByDay(state): Array<TransactionGroup> {
    const groupsByDay = state.transactions.reduce(
      (
        res: Record<number, TransactionGroup>,
        tx: Transaction
      ): Record<number, TransactionGroup> => {
        const groupKey = dayjs.unix(tx.timeStamp).startOf('day').unix();
        if (res[groupKey] !== undefined) {
          const retVal = { ...res[groupKey] };
          retVal.transactions.push(tx);

          return { ...res, [groupKey]: retVal };
        }

        return {
          ...res,
          [groupKey]: { timeStamp: groupKey, transactions: [tx] }
        };
      },
      {}
    );

    return Object.values(groupsByDay);
  },
  isWalletConnected(state: AccountStoreState): boolean {
    return state.currentAddress !== undefined;
  },
  savingsInfoBalanceNative(state): string {
    if (state.isSavingsInfoLoading) {
      return 'loading...';
    }

    if (state.savingsInfo === undefined) {
      return '';
    }

    return fromWei(state.savingsInfo.currentBalance, 6);
  },
  savingsInfoEarnedThisMonthNative(state): string {
    if (state.isSavingsInfoLoading) {
      return 'loading...';
    }

    if (state.savingsInfo === undefined) {
      return '';
    }

    return fromWei(state.savingsInfo.earnedThisMonth, 6);
  },
  savingsInfoEarnedTotalNative(state): string {
    if (state.isSavingsInfoLoading) {
      return 'loading...';
    }

    if (state.savingsInfo === undefined) {
      return '';
    }

    return fromWei(state.savingsInfo.earnedTotal, 6);
  },
  savingsInfoTotalPoolBalanceNative(state): string {
    if (state.isSavingsInfoLoading) {
      return 'loading...';
    }

    if (state.savingsInfo === undefined) {
      return '';
    }

    return fromWei(state.savingsInfo.currentPoolBalance, 6);
  },
  savingsMonthStatsOptions(state): Array<MonthBalanceItem> {
    if (state.isSavingsInfoLoading || state.savingsInfo === undefined) {
      return [];
    }

    return state.savingsInfo.last12MonthsBalances
      .reduce((acc, val) => {
        if (val.balance === 0) {
          return acc;
        }

        return acc.concat(val);
      }, [] as Array<MonthBalanceItem>)
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  },
  savingsInfoChartData(state): ChartData {
    if (state.savingsInfo === undefined || state.isSavingsInfoLoading) {
      return {
        datasets: [],
        labels: []
      };
    }

    const labels: Array<string> = [];
    const data: Array<number> = [];
    state.savingsInfo.last12MonthsBalances.forEach((item) => {
      labels.push(
        dateFromExplicitPair(item.year, item.month)
          .format('MMM, YY')
          .toUpperCase()
      );

      data.push(fromWei(item.balance, 6) as unknown as number);
    });

    return {
      labels,
      datasets: [{ data }]
    } as ChartData;
  }
} as GetterTree<AccountStoreState, RootStoreState>;
