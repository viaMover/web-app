import {
  TreasuryInfo,
  TreasuryMonthBonusesItem,
  TreasuryReceipt
} from '@/services/mover';
import { calcTreasuryBoost } from '@/store/modules/account/utils/treasury';
import { GettersFuncs } from '@/store/types';
import { sameAddress } from '@/utils/address';
import { add, fromWei, greaterThan, multiply } from '@/utils/bigmath';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData
} from '@/wallet/references/data';

import { TreasuryStoreState } from './types';

type Getters = {
  treasuryInfo: TreasuryInfo | undefined;
  treasuryBonusNative: string;
  treasuryBoost: string;
  hasActiveTreasury: boolean;
  treasuryMonthStatsOptions: Array<TreasuryMonthBonusesItem>;
  treasuryEarnedThisMonth: string;
  treasuryEarnedThisMonthNative: string;
  treasuryStakedMove: string;
  treasuryStakedMoveLP: string;
  treasuryStakedBalanceNative: string;
  treasuryTotalStakedBalanceNative: string;
  treasuryEarnedTotal: string;
  treasuryEarnedTotalNative: string;
  treasuryEarnedToday: string;
  treasuryEarnedTodayNative: string;
  treasurySpentToday: string;
  treasurySpentTodayNative: string;
  treasurySpentThisMonth: string;
  treasurySpentThisMonthNative: string;
  treasurySpentTotal: string;
  treasurySpentTotalNative: string;
  usdcNativePrice: string;
  moveNativePrice: string;
  slpNativePrice: string;
  treasuryReceipt: (
    y: number,
    m: number
  ) => Promise<TreasuryReceipt> | undefined;
};

const getters: GettersFuncs<Getters, TreasuryStoreState> = {
  treasuryInfo(state): TreasuryInfo | undefined {
    if (state.treasuryInfo === undefined) {
      return undefined;
    }

    if (state.treasuryInfo.expDate > Date.now()) {
      return state.treasuryInfo.data;
    }

    return undefined;
  },
  treasuryBonusNative(state, getters): string {
    if (state.treasuryBonus === undefined) {
      return '0';
    }
    return multiply(state.treasuryBonus, getters.usdcNativePrice);
  },
  treasuryBoost(state, _, rootState): string {
    if (
      state.treasuryBalanceMove === undefined ||
      state.treasuryBalanceLP === undefined ||
      rootState.account?.networkInfo === undefined
    ) {
      return '0';
    }

    const network = rootState.account.networkInfo.network;
    const tokens = rootState.account.tokens;

    const walletBalanceMove =
      tokens.find((t) =>
        sameAddress(t.address, getMoveAssetData(network).address)
      )?.balance ?? '0';
    const walletBalanceLP =
      tokens.find((t) =>
        sameAddress(t.address, getMoveWethLPAssetData(network).address)
      )?.balance ?? '0';

    return calcTreasuryBoost(
      state.treasuryBalanceMove,
      state.treasuryBalanceLP,
      walletBalanceMove,
      walletBalanceLP,
      state.powercardState ?? 'NotStaked'
    );
  },
  hasActiveTreasury(state, getters): boolean {
    const isTreasuryBalanceMoveNotEmpty =
      state.treasuryBalanceMove !== undefined &&
      greaterThan(state.treasuryBalanceMove, 0);
    const isTreasuryBalanceLPNotEmpty =
      state.treasuryBalanceLP !== undefined &&
      greaterThan(state.treasuryBalanceLP, 0);

    if (isTreasuryBalanceMoveNotEmpty || isTreasuryBalanceLPNotEmpty) {
      return true;
    }

    if (getters.treasuryInfo !== undefined && !state.isTreasuryInfoLoading) {
      const isCurrentStakedMoveNotEmpty =
        getters.treasuryInfo.currentStakedMove > 0;
      const isCurrentStakedMoveLPNotEmpty =
        getters.treasuryInfo.currentStakedMoveLP > 0;

      if (isCurrentStakedMoveNotEmpty || isCurrentStakedMoveLPNotEmpty) {
        return true;
      }

      const hadAtLeastOneMonthWithNonZeroBalance =
        getters.treasuryInfo.last12MonthsBonuses.some(
          (item) => item.bonusesEarned > 0
        );

      if (hadAtLeastOneMonthWithNonZeroBalance) {
        return true;
      }
    }

    return false;
  },
  treasuryMonthStatsOptions(state, getters): Array<TreasuryMonthBonusesItem> {
    if (state.isTreasuryInfoLoading || getters.treasuryInfo === undefined) {
      return [];
    }

    let hasTrimmedLeft = false;
    return getters.treasuryInfo.last12MonthsBonuses
      .reduce((acc, item) => {
        if (item.bonusesEarned === 0 && !hasTrimmedLeft) {
          return acc;
        }

        hasTrimmedLeft = true;
        return [...acc, item];
      }, new Array<TreasuryMonthBonusesItem>())
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  },
  treasuryEarnedThisMonth(state, getters, rootSate): string {
    if (
      state.isTreasuryInfoLoading ||
      getters.treasuryInfo === undefined ||
      rootSate.account?.networkInfo === undefined ||
      getters.treasuryInfo.earnedThisMonth === 0
    ) {
      return '0';
    }

    return fromWei(
      getters.treasuryInfo.earnedThisMonth,
      getUSDCAssetData(rootSate.account.networkInfo.network).decimals
    );
  },
  treasuryEarnedThisMonthNative(state, getters): string {
    return multiply(getters.treasuryEarnedThisMonth, getters.usdcNativePrice);
  },
  treasuryStakedMove(state, getters, rootState): string {
    let balanceMove = '0';

    if (state.treasuryBalanceMove !== undefined) {
      balanceMove = state.treasuryBalanceMove;
    }

    if (
      balanceMove == '0' &&
      !state.isTreasuryInfoLoading &&
      getters.treasuryInfo !== undefined &&
      rootState.account?.networkInfo !== undefined &&
      getters.treasuryInfo.currentStakedMove > 0
    ) {
      balanceMove = fromWei(
        getters.treasuryInfo.currentStakedMove,
        getMoveAssetData(rootState.account.networkInfo.network).decimals
      );
    }

    return balanceMove;
  },
  treasuryStakedMoveLP(state, getters, rootState): string {
    let balanceMoveLP = '0';

    if (state.treasuryBalanceLP !== undefined) {
      balanceMoveLP = state.treasuryBalanceLP;
    }

    if (
      balanceMoveLP == '0' &&
      !state.isTreasuryInfoLoading &&
      getters.treasuryInfo !== undefined &&
      rootState.account?.networkInfo !== undefined &&
      getters.treasuryInfo.currentStakedMoveLP > 0
    ) {
      balanceMoveLP = fromWei(
        getters.treasuryInfo.currentStakedMoveLP,
        getMoveWethLPAssetData(rootState.account.networkInfo.network).decimals
      );
    }

    return balanceMoveLP;
  },
  treasuryStakedBalanceNative(state, getters): string {
    const stakedMoveNative = multiply(
      getters.treasuryStakedMove,
      getters.moveNativePrice
    );
    const stakedMoveEthLPNative = multiply(
      getters.treasuryStakedMoveLP,
      getters.slpNativePrice
    );

    return add(stakedMoveNative, stakedMoveEthLPNative);
  },
  treasuryTotalStakedBalanceNative(state, getters, rootState): string {
    let balanceMove = '0';
    let balanceMoveLP = '0';
    if (state.treasuryTotalStakedMove !== undefined) {
      balanceMove = state.treasuryTotalStakedMove;
    }

    if (state.treasuryTotalStakedMoveEthLP !== undefined) {
      balanceMoveLP = state.treasuryTotalStakedMoveEthLP;
    }

    if (
      !state.isTreasuryInfoLoading &&
      getters.treasuryInfo !== undefined &&
      rootState.account?.networkInfo !== undefined
    ) {
      if (
        balanceMove === '0' &&
        getters.treasuryInfo.currentTotalStakedMove > 0
      ) {
        balanceMove = fromWei(
          getters.treasuryInfo.currentTotalStakedMove,
          getMoveAssetData(rootState.account.networkInfo.network).decimals
        );
      }

      if (
        balanceMoveLP === '0' &&
        getters.treasuryInfo.currentTotalStakedMoveLP > 0
      ) {
        balanceMoveLP = fromWei(
          getters.treasuryInfo.currentTotalStakedMoveLP,
          getMoveWethLPAssetData(rootState.account.networkInfo.network).decimals
        );
      }
    }

    const balanceMoveNative = multiply(balanceMove, getters.moveNativePrice);
    const balanceMoveLPNative = multiply(balanceMoveLP, getters.slpNativePrice);

    return add(balanceMoveNative, balanceMoveLPNative);
  },
  treasuryEarnedTotal(state, getters, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      getters.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      getters.treasuryInfo.earnedTotal === 0
    ) {
      return '0';
    }

    return fromWei(
      getters.treasuryInfo.earnedTotal,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasuryEarnedTotalNative(state, getters): string {
    return multiply(getters.treasuryEarnedTotal, getters.usdcNativePrice);
  },
  treasuryEarnedToday(state, getters, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      getters.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      getters.treasuryInfo.earnedToday === 0
    ) {
      return '0';
    }

    return fromWei(
      getters.treasuryInfo.earnedToday,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasuryEarnedTodayNative(state, getters): string {
    return multiply(getters.treasuryEarnedToday, getters.usdcNativePrice);
  },
  treasurySpentToday(state, getters, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      getters.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      getters.treasuryInfo.spentToday === 0
    ) {
      return '0';
    }

    return fromWei(
      getters.treasuryInfo.spentToday,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasurySpentTodayNative(state, getters): string {
    return multiply(getters.treasurySpentToday, getters.usdcNativePrice);
  },
  treasurySpentThisMonth(state, getters, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      getters.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      getters.treasuryInfo.spentThisMonth === 0
    ) {
      return '0';
    }

    return fromWei(
      getters.treasuryInfo.spentThisMonth,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasurySpentThisMonthNative(state, getters): string {
    return multiply(getters.treasurySpentThisMonth, getters.usdcNativePrice);
  },
  treasurySpentTotal(state, getters, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      getters.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      getters.treasuryInfo.spentTotal === 0
    ) {
      return '0';
    }

    return fromWei(
      getters.treasuryInfo.spentTotal,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasurySpentTotalNative(state, getters): string {
    return multiply(getters.treasurySpentTotal, getters.usdcNativePrice);
  },
  moveNativePrice(state, _, rootState, rootGetters): string {
    return rootGetters['account/moveNativePrice'];
  },
  slpNativePrice(state, _, rootState, rootGetters): string {
    return rootGetters['account/slpNativePrice'];
  },
  usdcNativePrice(state, _, rootState, rootGetters): string {
    return rootGetters['account/usdcNativePrice'];
  },
  treasuryReceipt(
    state
  ): (year: number, month: number) => Promise<TreasuryReceipt> | undefined {
    return (year, month): Promise<TreasuryReceipt> | undefined => {
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
