import { GetterTree } from 'vuex';
import { AccountStoreState, TransactionGroup } from './types';
import { RootStoreState } from '@/store/types';
import dayjs from 'dayjs';
import { Transaction } from '@/wallet/types';
import { ChartData } from '@/components/charts';
import { add, fromWei, multiply } from '@/utils/bigmath';
import { MonthBalanceItem } from '@/services/mover/savings';
import { dateFromExplicitPair } from '@/utils/time';
import { buildChartData } from '@/store/modules/account/utils/charts';

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
  isWalletConnected(state): boolean {
    return state.currentAddress !== undefined;
  },
  isWalletReady(state, getters): boolean {
    return (
      getters.isWalletConnected &&
      state.provider !== undefined &&
      !state.isDetecting &&
      state.savingsInfo !== undefined
    );
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
  entireBalance(state): string {
    let balance = '0';
    balance = state.tokens.reduce<string>((acc, token) => {
      const tokenPrice = multiply(token.balance, token.priceUSD);
      if (tokenPrice) {
        return add(acc, tokenPrice);
      }
      return acc;
    }, '0');

    if (state.savingsInfo !== undefined) {
      const savingsBalanceInUSDC = fromWei(
        state.savingsInfo.currentBalance,
        '6'
      );
      balance = add(balance, savingsBalanceInUSDC);
    }

    return balance;
  },
  moveNativePrice(state): string {
    if (state.movePriceInWeth === undefined || state.ethPrice === undefined) {
      return '0';
    }
    return multiply(state.movePriceInWeth, state.ethPrice);
  },
  usdcNativePrice(state): string {
    if (state.usdcPriceInWeth === undefined || state.ethPrice === undefined) {
      return '0';
    }
    return multiply(state.usdcPriceInWeth, state.ethPrice);
  },
  savingsMonthStatsOptions(state): Array<MonthBalanceItem> {
    if (state.isSavingsInfoLoading || state.savingsInfo === undefined) {
      return [];
    }

    return state.savingsInfo.last12MonthsBalances
      .filter((item) => item.balance !== 0)
      .slice()
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  },
  savingsInfoChartData(state): ChartData {
    if (state.savingsInfo === undefined || state.isSavingsInfoLoading) {
      return {
        datasets: [],
        labels: []
      };
    }

    const data = buildChartData(state.savingsInfo.last12MonthsBalances, 'all');
    return {
      ...data,
      labels: data.labels.map((l) => dayjs(l).format('MMM, YY'))
    };
  },
  savingsMonthChartData(state): ChartData {
    if (state.savingsReceipt === undefined || state.isSavingsReceiptLoading) {
      return {
        datasets: [],
        labels: []
      };
    }

    return buildChartData(state.savingsReceipt.hourlyBalances, 'all');
  },
  savingsLastWeekChartData(state): ChartData {
    if (state.savingsReceipt === undefined || state.isSavingsReceiptLoading) {
      return {
        datasets: [],
        labels: []
      };
    }

    return buildChartData(state.savingsReceipt.hourlyBalances, 'week');
  },
  savingsLastDayChartData(state): ChartData {
    if (state.savingsReceipt === undefined || state.isSavingsReceiptLoading) {
      return {
        datasets: [],
        labels: []
      };
    }

    return buildChartData(state.savingsReceipt.hourlyBalances, 'day');
  },
  hasActiveSavings(state): boolean {
    if (state.isSavingsInfoLoading) {
      return true;
    }

    if (state.savingsInfo === undefined) {
      return false;
    }

    // obvious check
    if (
      state.savingsInfo.currentBalance !== 0 ||
      state.savingsInfo.earnedTotal !== 0 ||
      state.savingsInfo.last12MonthsBalances.some((item) => item.balance !== 0)
    ) {
      return true;
    }

    //implicit check (last resort)
    return (
      state.savingsReceipt !== undefined &&
      (state.savingsReceipt.totalDeposits !== 0 ||
        state.savingsReceipt.totalWithdrawals !== 0)
    );
  }
} as GetterTree<AccountStoreState, RootStoreState>;
