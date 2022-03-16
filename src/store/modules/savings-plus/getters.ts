import { unwrapCacheItem } from '@/store/modules/utils';
import { GettersFuncs } from '@/store/types';
import { fromWei, greaterThan, multiply } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

import { SavingsPlusInfo, SavingsPlusStoreState } from './types';

type Getters = {
  info: SavingsPlusInfo | undefined;
  usdcNativePrice: string;
  hasActiveSavingsPlus: boolean;
  balanceNative: string;
  infoBalanceUSDC: string;
  infoBalanceNative: string;
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

    return true;
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
  infoBalanceNative(state, getters): string {
    return multiply(getters.infoBalanceUSDC, getters.usdcNativePrice);
  }
};

export type GetterType = typeof getters;
export default getters;
