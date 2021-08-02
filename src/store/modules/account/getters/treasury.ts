import { GetterTree } from 'vuex';

import gt from 'lodash-es/gt';
import {
  add,
  divide,
  fromWei,
  isFinite,
  isNaN,
  multiply
} from '@/utils/bigmath';

import { sameAddress } from '@/utils/address';
import { AccountStoreState } from '../types';
import { RootStoreState } from '@/store/types';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData
} from '@/wallet/references/data';
import { TreasuryMonthBonusesItem } from '@/services/mover';

export default {
  treasuryBonusNative(state, getters): string {
    if (state.treasuryBonus === undefined) {
      return '0';
    }
    return multiply(state.treasuryBonus, getters.usdcNativePrice);
  },
  treasuryBoost(state): string {
    if (
      state.treasuryBalanceMove === undefined ||
      state.treasuryBalanceLP === undefined ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    const network = state.networkInfo.network;
    const tokenWeight = '1';
    const lpWeight = '2.5';

    const moveBalanceOnWallet =
      state.tokens.find((t) =>
        sameAddress(t.address, getMoveAssetData(network).address)
      )?.balance ?? '0';
    const lpBalanceOnWallet =
      state.tokens.find((t) =>
        sameAddress(t.address, getMoveWethLPAssetData(network).address)
      )?.balance ?? '0';

    let boostMove = multiply(
      divide(
        state.treasuryBalanceMove,
        add(moveBalanceOnWallet, state.treasuryBalanceMove)
      ),
      tokenWeight
    );

    if (isNaN(boostMove) || !isFinite(boostMove)) {
      boostMove = '0';
    }

    let boostLP = multiply(
      divide(
        state.treasuryBalanceLP,
        add(lpBalanceOnWallet, state.treasuryBalanceLP)
      ),
      lpWeight
    );

    if (isNaN(boostLP) || !isFinite(boostLP)) {
      boostLP = '0';
    }

    return add(boostMove, boostLP);
  },
  hasActiveTreasury(state): boolean {
    const isTreasuryBalanceMoveNotEmpty =
      state.treasuryBalanceMove !== undefined &&
      gt(state.treasuryBalanceMove, 0);
    const isTreasuryBalanceLPNotEmpty =
      state.treasuryBalanceLP !== undefined && gt(state.treasuryBalanceLP, 0);

    if (isTreasuryBalanceMoveNotEmpty || isTreasuryBalanceLPNotEmpty) {
      return true;
    }

    if (state.treasuryInfo !== undefined && !state.isTreasuryInfoLoading) {
      const isCurrentStakedMoveNotEmpty =
        state.treasuryInfo.currentStakedMove > 0;
      const isCurrentStakedMoveLPNotEmpty =
        state.treasuryInfo.currentStakedMoveLP > 0;

      if (isCurrentStakedMoveNotEmpty || isCurrentStakedMoveLPNotEmpty) {
        return true;
      }

      const hadAtLeastOneMonthWithNonZeroBalance =
        state.treasuryInfo.last12MonthsBonuses.some(
          (item) => item.bonusesEarned > 0
        );

      if (hadAtLeastOneMonthWithNonZeroBalance) {
        return true;
      }
    }

    if (
      state.treasuryReceipt !== undefined &&
      !state.isTreasuryReceiptLoading
    ) {
      const isEndOfMonthBalanceMoveNotEmpty =
        state.treasuryReceipt.endOfMonthBalanceMove > 0;
      const isEndOfMonthBalanceMoveLPNotEmpty =
        state.treasuryReceipt.endOfMonthBalanceMoveLP > 0;
      const isTotalDepositsMoveNotEmpty =
        state.treasuryReceipt.totalDepositsMove > 0;
      const isTotalDepositsMoveLPNotEmpty =
        state.treasuryReceipt.totalDepositsMoveLP > 0;
      const isTotalWithdrawalsMoveNotEmpty =
        state.treasuryReceipt.totalWithdrawalsMove > 0;
      const isTotalWithdrawalsMoveLPNotEmpty =
        state.treasuryReceipt.totalWithdrawalsMoveLP > 0;

      if (
        isEndOfMonthBalanceMoveNotEmpty ||
        isEndOfMonthBalanceMoveLPNotEmpty ||
        isTotalDepositsMoveNotEmpty ||
        isTotalDepositsMoveLPNotEmpty ||
        isTotalWithdrawalsMoveNotEmpty ||
        isTotalWithdrawalsMoveLPNotEmpty
      ) {
        return true;
      }
    }

    return false;
  },
  treasuryMonthStatsOptions(state): Array<TreasuryMonthBonusesItem> {
    if (state.isTreasuryInfoLoading || state.treasuryInfo === undefined) {
      return [];
    }

    return state.treasuryInfo.last12MonthsBonuses
      .filter((item) => item.bonusesEarned !== 0)
      .slice()
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  },
  treasuryEarnedThisMonth(state): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.earnedThisMonth,
      getUSDCAssetData(state.networkInfo.network).decimals
    );
  },
  treasuryEarnedThisMonthNative(state, getters): string {
    return multiply(getters.treasuryEarnedThisMonth, getters.usdcNativePrice);
  },
  treasuryStakedMove(state): string {
    let balanceMove = '0';

    if (state.treasuryBalanceMove) {
      balanceMove = state.treasuryBalanceMove;
    }

    if (
      balanceMove == '0' &&
      !state.isTreasuryInfoLoading &&
      state.treasuryInfo !== undefined &&
      state.networkInfo !== undefined
    ) {
      balanceMove = fromWei(
        state.treasuryInfo.currentStakedMove,
        getUSDCAssetData(state.networkInfo.network).decimals
      );
    }

    return balanceMove;
  },
  treasuryStakedMoveLP(state): string {
    let balanceMoveLP = '0';

    if (state.treasuryBalanceLP) {
      balanceMoveLP = state.treasuryBalanceLP;
    }

    if (
      balanceMoveLP == '0' &&
      !state.isTreasuryInfoLoading &&
      state.treasuryInfo !== undefined &&
      state.networkInfo !== undefined
    ) {
      balanceMoveLP = fromWei(
        state.treasuryInfo.currentStakedMoveLP,
        getUSDCAssetData(state.networkInfo.network).decimals
      );
    }

    return balanceMoveLP;
  },
  treasuryStakedBalance(state, getters): string {
    return add(getters.treasuryStakedMove, getters.treasuryStakedMoveLP);
  },
  treasuryStakedBalanceNative(state, getters): string {
    return multiply(getters.treasuryStakedBalance, getters.usdcNativePrice);
  },
  treasuryTotalStakedBalance(state): string {
    let balanceMove = '0';
    let balanceMoveLP = '0';
    if (state.treasuryTotalStakedMove) {
      balanceMove = state.treasuryTotalStakedMove;
    }

    if (state.treasuryTotalStakedMoveEthLP) {
      balanceMoveLP = state.treasuryTotalStakedMoveEthLP;
    }

    if (
      !state.isTreasuryInfoLoading &&
      state.treasuryInfo !== undefined &&
      state.networkInfo !== undefined
    ) {
      if (balanceMove == '0') {
        balanceMove = fromWei(
          state.treasuryInfo.currentTotalStakedMove,
          getUSDCAssetData(state.networkInfo.network).decimals
        );
      }

      if (balanceMoveLP == '0') {
        balanceMoveLP = fromWei(
          state.treasuryInfo.currentTotalStakedMoveLP,
          getUSDCAssetData(state.networkInfo.network).decimals
        );
      }
    }

    return add(balanceMove, balanceMoveLP);
  },
  treasuryTotalStakedBalanceNative(state, getters): string {
    return multiply(
      getters.treasuryTotalStakedBalance,
      getters.usdcNativePrice
    );
  },
  treasuryEarnedTotal(state): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      state.networkInfo === undefined
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.earnedTotal,
      getUSDCAssetData(state.networkInfo.network).decimals
    );
  },
  treasuryEarnedTotalNative(state, getters): string {
    return multiply(getters.treasuryEarnedTotal, getters.usdcNativePrice);
  }
} as GetterTree<AccountStoreState, RootStoreState>;
