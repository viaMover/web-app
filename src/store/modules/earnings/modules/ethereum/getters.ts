import { GetterTree } from 'vuex';

import gt from 'lodash-es/gt';

import { EthereumMonthBalanceItem } from '@/services/mover';
import { RootStoreState } from '@/store/types';
import { divide, fromWei, multiply } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

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
  },
  ethereumInfoEarnedThisMonthNative(state, getters, rootState): string {
    if (
      state.ethereumInfo === undefined ||
      state.isEthereumInfoLoading ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    const valueInUSDC = fromWei(
      state.ethereumInfo.earnedThisMonth,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );

    return multiply(valueInUSDC, getters.usdcNativePrice);
  },
  ethereumEarnedThisMonth(state, getters, rootState): string {
    if (
      state.isEthereumInfoLoading ||
      state.ethereumInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      state.ethereumInfo.earnedThisMonth === 0
    ) {
      return '0';
    }

    return fromWei(
      state.ethereumInfo.earnedThisMonth,
      getUSDCAssetData(rootState.account?.networkInfo.network).decimals
    );
  },
  ethereumEarnedThisMonthNative(
    state,
    getters,
    rootState,
    rootGetters
  ): string {
    return multiply(
      getters.ethereumEarnedThisMonth,
      rootGetters['account/usdcNativePrice']
    );
  },
  ethereumMonthStatsOptions(state): Array<EthereumMonthBalanceItem> {
    if (state.isEthereumInfoLoading || state.ethereumInfo === undefined) {
      return [];
    }

    let hasTrimmedLeft = false;
    return state.ethereumInfo.last12MonthsBalances
      .reduce((acc, item) => {
        if (item.balance === 0 && !hasTrimmedLeft) {
          return acc;
        }

        hasTrimmedLeft = true;
        return [...acc, item];
      }, new Array<EthereumMonthBalanceItem>())
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  }
} as GetterTree<EarningsEthereumStoreState, RootStoreState>;
