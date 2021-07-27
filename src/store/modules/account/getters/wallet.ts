import { GetterTree } from 'vuex';
import dayjs from 'dayjs';

import { AccountStoreState, TransactionGroup } from '../types';
import { RootStoreState } from '@/store/types';
import { Transaction } from '@/wallet/types';
import { add, divide, fromWei, multiply } from '@/utils/bigmath';
import { MonthBalanceItem } from '@/services/mover/savings';
import { getUSDCAssetData } from '@/wallet/references/data';

export default {
  transactionsGroupedByDay(state): Array<TransactionGroup> {
    const groupsByDay = state.transactions.reduce(
      (
        res: Record<number, TransactionGroup>,
        tx: Transaction
      ): Record<number, TransactionGroup> => {
        const groupKey = dayjs.unix(tx.timestamp).startOf('day').unix();
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
    return Object.values(groupsByDay).reverse();
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
  savingsInfoBalanceUSDC(state): string {
    if (
      state.savingsInfo === undefined ||
      state.networkInfo === undefined ||
      state.isSavingsInfoLoading
    ) {
      return '0';
    }

    return fromWei(
      state.savingsInfo.currentBalance,
      getUSDCAssetData(state.networkInfo.network).decimals
    );
  },
  savingsInfoBalanceNative(state, getters): string {
    return multiply(getters.savingsInfoBalanceUSDC, getters.usdcNativePrice);
  },
  savingsInfoEarnedThisMonthNative(state, getters): string {
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    const valueInUSDC = fromWei(
      state.savingsInfo.earnedThisMonth,
      getUSDCAssetData(state.networkInfo.network).decimals
    );

    return multiply(valueInUSDC, getters.usdcNativePrice);
  },
  savingsInfoEarnedTotalNative(state): string {
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      state.savingsInfo.earnedTotal,
      getUSDCAssetData(state.networkInfo.network).decimals
    );
  },
  savingsInfoTotalPoolBalanceNative(state, getters): string {
    if (
      state.savingsInfo === undefined ||
      state.isSavingsInfoLoading ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    const balanceUSDC = fromWei(
      state.savingsInfo.currentPoolBalance,
      getUSDCAssetData(state.networkInfo.network).decimals
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
  savingsEndOfMonthBalanceNative(state, getters): string {
    if (
      state.savingsReceipt === undefined ||
      state.isSavingsReceiptLoading ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    const balanceInUSDC = fromWei(
      state.savingsReceipt.endOfMonthBalance,
      getUSDCAssetData(state.networkInfo.network).decimals
    );

    return multiply(balanceInUSDC, getters.usdcNativePrice);
  },
  savingsMonthEarnedNative(state, getters): string {
    if (
      state.savingsReceipt === undefined ||
      state.isSavingsReceiptLoading ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    return '0';
  },
  savingsMonthAverageEarnedNative(state, getters): string {
    if (
      state.savingsReceipt === undefined ||
      state.isSavingsReceiptLoading ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    return '0';
  },
  savingsMonthTotalDepositsNative(state, getters): string {
    if (
      state.savingsReceipt === undefined ||
      state.isSavingsReceiptLoading ||
      state.networkInfo === undefined ||
      state.savingsReceipt.totalDeposits === 0
    ) {
      return '0';
    }

    const depositsInUSDC = fromWei(
      state.savingsReceipt.totalDeposits,
      getUSDCAssetData(state.networkInfo.network).decimals
    );

    return multiply(depositsInUSDC, getters.usdcNativePrice);
  },
  savingsMonthTotalWithdrawalsNative(state, getters): string {
    if (
      state.savingsReceipt === undefined ||
      state.isSavingsReceiptLoading ||
      state.networkInfo === undefined ||
      state.savingsReceipt.totalWithdrawals === 0
    ) {
      return '0';
    }

    const withdrawalsInUSDC = fromWei(
      state.savingsReceipt.totalWithdrawals,
      getUSDCAssetData(state.networkInfo.network).decimals
    );

    return multiply(withdrawalsInUSDC, getters.usdcNativePrice);
  },
  entireBalance(state, getters): string {
    let balance = '0';
    balance = state.tokens.reduce<string>((acc, token) => {
      const tokenPrice = multiply(token.balance, token.priceUSD);
      if (tokenPrice) {
        return add(acc, tokenPrice);
      }
      return acc;
    }, '0');

    if (state.savingsInfo !== undefined && state.networkInfo !== undefined) {
      const savingsBalanceInUSDC = fromWei(
        state.savingsInfo.currentBalance,
        getUSDCAssetData(state.networkInfo.network).decimals
      );
      balance = add(
        balance,
        multiply(savingsBalanceInUSDC, getters.usdcNativePrice)
      );
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
  slpNativePrice(state): string {
    if (state.slpPriceInWeth === undefined || state.ethPrice === undefined) {
      return '0';
    }
    return multiply(state.slpPriceInWeth, state.ethPrice);
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
