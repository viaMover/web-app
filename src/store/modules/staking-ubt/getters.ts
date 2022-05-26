import {
  StakingUbtInfo,
  StakingUbtMonthBalanceItem,
  StakingUbtReceipt
} from '@/services/v2/api/mover/staking-ubt';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { unwrapCacheItem } from '@/store/modules/utils';
import { GettersFuncs } from '@/store/types';
import { sameAddress } from '@/utils/address';
import { divide, fromWei, greaterThan, multiply } from '@/utils/bigmath';
import { getUBTAssetData } from '@/wallet/references/data';

import { StakingUbtStoreState } from './types';

type Getters = {
  info: StakingUbtInfo | undefined;
  balance: string;
  balanceNative: string;
  walletBalance: string;
  walletBalanceNative: string;
  monthStatsOptions: Array<StakingUbtMonthBalanceItem>;
  hasActiveStaking: boolean;
  receipt: (y: number, m: number) => Promise<StakingUbtReceipt> | undefined;
  ubtNativePrice: string;
  avg30DaysAPY: string;
  earnedThisMonth: string;
  earnedThisMonthNative: string;
  earnedTotal: string;
  earnedTotalNative: string;
  estimatedEarningsTomorrowNative: string;
  estimatedEarningsNextMonthNative: string;
  estimatedEarningsAnnuallyNative: string;
};

const getters: GettersFuncs<Getters, StakingUbtStoreState> = {
  info(state): StakingUbtInfo | undefined {
    return unwrapCacheItem(state.info);
  },
  balance(state, getters, rootState): string {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return '0';
    }

    const ubtAssetData = getUBTAssetData(rootState.account.networkInfo.network);

    if (state.contractUbtBalance !== undefined) {
      return fromWei(state.contractUbtBalance, ubtAssetData.decimals);
    }

    if (getters.info !== undefined) {
      return fromWei(getters.info.currentBalance, ubtAssetData.decimals);
    }

    return '0';
  },
  ubtNativePrice(state, getters, rootState): string {
    if (state.ubtNativePrice !== undefined) {
      return state.ubtNativePrice;
    }

    if (ensureAccountStateIsSafe(rootState.account)) {
      const ubtAssetData = getUBTAssetData(
        rootState.account.networkInfo.network
      );

      const ubtWalletToken = rootState.account.tokens.find((t) =>
        sameAddress(t.address, ubtAssetData.address)
      );
      if (ubtWalletToken !== undefined) {
        return ubtWalletToken.priceUSD;
      }
    }

    return '0';
  },
  balanceNative(state, getters): string {
    return multiply(getters.balance, getters.ubtNativePrice);
  },
  walletBalance(state, getters, rootState): string {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return '0';
    }

    const ubtAssetData = getUBTAssetData(rootState.account.networkInfo.network);

    const ubtWalletToken = rootState.account.tokens.find((t) =>
      sameAddress(t.address, ubtAssetData.address)
    );
    if (ubtWalletToken !== undefined) {
      return ubtWalletToken.balance;
    }

    return '0';
  },
  walletBalanceNative(state, getters): string {
    return multiply(getters.walletBalance, getters.ubtNativePrice);
  },
  monthStatsOptions(state, getters): Array<StakingUbtMonthBalanceItem> {
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
      }, new Array<StakingUbtMonthBalanceItem>())
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
  hasActiveStaking(state, getters): boolean {
    if (greaterThan(getters.balance, 0)) {
      return true;
    }

    const info = getters.info;
    if (info !== undefined) {
      const activeByInfo =
        greaterThan(info.earnedTotal, 0) ||
        info.last12MonthsBalances.some((b) => greaterThan(b.earned, 0)) ||
        (info.actionHistory?.length ?? 0) > 0;
      if (activeByInfo) {
        return activeByInfo;
      }
    }

    return false;
  },
  receipt(
    state
  ): (year: number, month: number) => Promise<StakingUbtReceipt> | undefined {
    return (year, month): Promise<StakingUbtReceipt> | undefined => {
      const item = state.receipts.get(`${year}/${month}`);
      return unwrapCacheItem(item);
    };
  },
  avg30DaysAPY(state, getters): string {
    if (getters.info === undefined || state.isInfoLoading) {
      return '0';
    }

    return multiply(getters.info.avg30DaysAPY, 100);
  },
  earnedThisMonth(state, getters, rootState): string {
    if (
      getters.info !== undefined &&
      ensureAccountStateIsSafe(rootState.account)
    ) {
      const ubtAssetData = getUBTAssetData(
        rootState.account.networkInfo.network
      );
      return fromWei(getters.info.earnedThisMonth, ubtAssetData.decimals);
    }

    return '0';
  },
  earnedThisMonthNative(state, getters): string {
    return multiply(getters.earnedThisMonth, getters.ubtNativePrice);
  },
  earnedTotal(state, getters, rootState): string {
    if (
      getters.info === undefined ||
      state.isInfoLoading ||
      !ensureAccountStateIsSafe(rootState.account)
    ) {
      return '0';
    }

    return fromWei(
      getters.info.earnedTotal,
      getUBTAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  earnedTotalNative(state, getters): string {
    return multiply(getters.earnedTotal, getters.ubtNativePrice);
  },
  estimatedEarningsTomorrowNative(state, getters): string {
    if (state.dpy === undefined) {
      return '0';
    }

    const multiplier = divide(state.dpy, 100);
    return multiply(getters.balanceNative, multiplier);
  },
  estimatedEarningsNextMonthNative(state, getters): string {
    if (state.dpy === undefined) {
      return '0';
    }

    const multiplier = divide(multiply(state.dpy, 30), 100);
    return multiply(getters.balanceNative, multiplier);
  },
  estimatedEarningsAnnuallyNative(state, getters): string {
    if (state.apy === undefined) {
      return '0';
    }

    const multiplier = divide(state.apy, 100);
    return multiply(getters.balanceNative, multiplier);
  }
};

export type GetterType = typeof getters;
export default getters;
