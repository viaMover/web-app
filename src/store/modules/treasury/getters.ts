import gt from 'lodash-es/gt';

import { TreasuryMonthBonusesItem, TreasuryReceipt } from '@/services/mover';
import { calcTreasuryBoost } from '@/store/modules/account/utils/treasury';
import { GettersFuncs } from '@/store/types';
import { sameAddress } from '@/utils/address';
import { add, fromWei, multiply } from '@/utils/bigmath';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData
} from '@/wallet/references/data';

import { TreasuryStoreState } from './types';

type Getters = {
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
  // treasuryMonthEarnedThisMonth: string;
  // treasuryMonthEarnedThisMonthNative: string;
  // treasuryMonthBalanceNative: string;
  // treasuryMonthDepositedNative: string;
  // treasuryMonthWithdrewNative: string;
  // treasuryMonthBonusesUsed: string;
  // treasuryMonthBonusesUsedNative: string;
  // treasuryMonthAvgDailyEarnings: string;
  // treasuryMonthAvgDailyEarningsNative: string;
  // treasuryMonthAvgDailySpendings: string;
  // treasuryMonthAvgDailySpendingsNative: string;
  usdcNativePrice: string;
  moveNativePrice: string;
  slpNativePrice: string;
  treasuryReceipt: (
    y: number,
    m: number
  ) => Promise<TreasuryReceipt> | undefined;
};

const getters: GettersFuncs<Getters, TreasuryStoreState> = {
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

    // if (
    //   state.treasuryReceipt !== undefined &&
    //   !state.isTreasuryReceiptLoading
    // ) {
    //   const isEndOfMonthBalanceMoveNotEmpty =
    //     state.treasuryReceipt.endOfMonthBalanceMove > 0;
    //   const isEndOfMonthBalanceMoveLPNotEmpty =
    //     state.treasuryReceipt.endOfMonthBalanceMoveLP > 0;
    //   const isTotalDepositsMoveNotEmpty =
    //     state.treasuryReceipt.totalDepositsMove > 0;
    //   const isTotalDepositsMoveLPNotEmpty =
    //     state.treasuryReceipt.totalDepositsMoveLP > 0;
    //   const isTotalWithdrawalsMoveNotEmpty =
    //     state.treasuryReceipt.totalWithdrawalsMove > 0;
    //   const isTotalWithdrawalsMoveLPNotEmpty =
    //     state.treasuryReceipt.totalWithdrawalsMoveLP > 0;
    //
    //   if (
    //     isEndOfMonthBalanceMoveNotEmpty ||
    //     isEndOfMonthBalanceMoveLPNotEmpty ||
    //     isTotalDepositsMoveNotEmpty ||
    //     isTotalDepositsMoveLPNotEmpty ||
    //     isTotalWithdrawalsMoveNotEmpty ||
    //     isTotalWithdrawalsMoveLPNotEmpty
    //   ) {
    //     return true;
    //   }
    // }

    return false;
  },
  treasuryMonthStatsOptions(state): Array<TreasuryMonthBonusesItem> {
    if (state.isTreasuryInfoLoading || state.treasuryInfo === undefined) {
      return [];
    }

    let hasTrimmedLeft = false;
    return state.treasuryInfo.last12MonthsBonuses
      .reduce((acc, item) => {
        if (item.bonusesEarned === 0 && !hasTrimmedLeft) {
          return acc;
        }

        hasTrimmedLeft = true;
        return [...acc, item];
      }, new Array<TreasuryMonthBonusesItem>())
      .sort((a, b) => b.snapshotTimestamp - a.snapshotTimestamp);
  },
  treasuryEarnedThisMonth(state, _, rootSate): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      rootSate.account?.networkInfo === undefined ||
      state.treasuryInfo.earnedThisMonth === 0
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.earnedThisMonth,
      getUSDCAssetData(rootSate.account.networkInfo.network).decimals
    );
  },
  treasuryEarnedThisMonthNative(state, getters): string {
    return multiply(getters.treasuryEarnedThisMonth, getters.usdcNativePrice);
  },
  treasuryStakedMove(state, _, rootState): string {
    let balanceMove = '0';

    if (state.treasuryBalanceMove !== undefined) {
      balanceMove = state.treasuryBalanceMove;
    }

    if (
      balanceMove == '0' &&
      !state.isTreasuryInfoLoading &&
      state.treasuryInfo !== undefined &&
      rootState.account?.networkInfo !== undefined &&
      state.treasuryInfo.currentStakedMove > 0
    ) {
      balanceMove = fromWei(
        state.treasuryInfo.currentStakedMove,
        getMoveAssetData(rootState.account.networkInfo.network).decimals
      );
    }

    return balanceMove;
  },
  treasuryStakedMoveLP(state, _, rootState): string {
    let balanceMoveLP = '0';

    if (state.treasuryBalanceLP !== undefined) {
      balanceMoveLP = state.treasuryBalanceLP;
    }

    if (
      balanceMoveLP == '0' &&
      !state.isTreasuryInfoLoading &&
      state.treasuryInfo !== undefined &&
      rootState.account?.networkInfo !== undefined &&
      state.treasuryInfo.currentStakedMoveLP > 0
    ) {
      balanceMoveLP = fromWei(
        state.treasuryInfo.currentStakedMoveLP,
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
      state.treasuryInfo !== undefined &&
      rootState.account?.networkInfo !== undefined
    ) {
      if (
        balanceMove === '0' &&
        state.treasuryInfo.currentTotalStakedMove > 0
      ) {
        balanceMove = fromWei(
          state.treasuryInfo.currentTotalStakedMove,
          getMoveAssetData(rootState.account.networkInfo.network).decimals
        );
      }

      if (
        balanceMoveLP === '0' &&
        state.treasuryInfo.currentTotalStakedMoveLP > 0
      ) {
        balanceMoveLP = fromWei(
          state.treasuryInfo.currentTotalStakedMoveLP,
          getMoveWethLPAssetData(rootState.account.networkInfo.network).decimals
        );
      }
    }

    const balanceMoveNative = multiply(balanceMove, getters.moveNativePrice);
    const balanceMoveLPNative = multiply(balanceMoveLP, getters.slpNativePrice);

    return add(balanceMoveNative, balanceMoveLPNative);
  },
  treasuryEarnedTotal(state, _, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      state.treasuryInfo.earnedTotal === 0
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.earnedTotal,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasuryEarnedTotalNative(state, getters): string {
    return multiply(getters.treasuryEarnedTotal, getters.usdcNativePrice);
  },
  treasuryEarnedToday(state, _, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      state.treasuryInfo.earnedToday === 0
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.earnedToday,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasuryEarnedTodayNative(state, getters): string {
    return multiply(getters.treasuryEarnedToday, getters.usdcNativePrice);
  },
  treasurySpentToday(state, _, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      state.treasuryInfo.spentToday === 0
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.spentToday,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasurySpentTodayNative(state, getters): string {
    return multiply(getters.treasurySpentToday, getters.usdcNativePrice);
  },
  treasurySpentThisMonth(state, _, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      state.treasuryInfo.spentThisMonth === 0
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.spentThisMonth,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasurySpentThisMonthNative(state, getters): string {
    return multiply(getters.treasurySpentThisMonth, getters.usdcNativePrice);
  },
  treasurySpentTotal(state, _, rootState): string {
    if (
      state.isTreasuryInfoLoading ||
      state.treasuryInfo === undefined ||
      rootState.account?.networkInfo === undefined ||
      state.treasuryInfo.spentTotal === 0
    ) {
      return '0';
    }

    return fromWei(
      state.treasuryInfo.spentTotal,
      getUSDCAssetData(rootState.account.networkInfo.network).decimals
    );
  },
  treasurySpentTotalNative(state, getters): string {
    return multiply(getters.treasurySpentTotal, getters.usdcNativePrice);
  },
  // treasuryMonthEarnedThisMonth(state, _, rootState): string {
  //   if (
  //     state.isTreasuryReceiptLoading ||
  //     state.treasuryReceipt === undefined ||
  //     rootState.account?.networkInfo === undefined ||
  //     state.treasuryReceipt.earnedThisMonth === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   return fromWei(
  //     state.treasuryReceipt.earnedThisMonth,
  //     getUSDCAssetData(rootState.account.networkInfo.network).decimals
  //   );
  // },
  // treasuryMonthEarnedThisMonthNative(state, getters): string {
  //   return multiply(
  //     getters.treasuryMonthEarnedThisMonth,
  //     getters.usdcNativePrice
  //   );
  // },
  // treasuryMonthBalanceNative(state, getters, rootState): string {
  //   if (
  //     state.isTreasuryReceiptLoading ||
  //     state.treasuryReceipt === undefined ||
  //     rootState.account?.networkInfo === undefined
  //   ) {
  //     return '0';
  //   }
  //
  //   let moveBalanceNative = '0';
  //   if (state.treasuryReceipt.endOfMonthBalanceMove > 0) {
  //     const moveBalance = fromWei(
  //       state.treasuryReceipt.endOfMonthBalanceMove,
  //       getMoveAssetData(rootState.account.networkInfo.network).decimals
  //     );
  //     moveBalanceNative = multiply(moveBalance, getters.moveNativePrice);
  //   }
  //
  //   let moveLPBalanceNative = '0';
  //   if (state.treasuryReceipt.endOfMonthBalanceMoveLP > 0) {
  //     const moveLPBalance = fromWei(
  //       state.treasuryReceipt.endOfMonthBalanceMoveLP,
  //       getMoveWethLPAssetData(rootState.account.networkInfo.network).decimals
  //     );
  //     moveLPBalanceNative = multiply(moveLPBalance, getters.slpNativePrice);
  //   }
  //
  //   return add(moveBalanceNative, moveLPBalanceNative);
  // },
  // treasuryMonthDepositedNative(state, getters, rootState): string {
  //   if (
  //     state.isTreasuryReceiptLoading ||
  //     state.treasuryReceipt === undefined ||
  //     rootState.account?.networkInfo === undefined
  //   ) {
  //     return '0';
  //   }
  //
  //   let moveDepositsNative = '0';
  //   if (state.treasuryReceipt.totalDepositsMove > 0) {
  //     const moveDeposits = fromWei(
  //       state.treasuryReceipt.totalDepositsMove,
  //       getMoveAssetData(rootState.account.networkInfo.network).decimals
  //     );
  //     moveDepositsNative = multiply(moveDeposits, getters.moveNativePrice);
  //   }
  //
  //   let moveLPDepositsNative = '0';
  //   if (state.treasuryReceipt.totalDepositsMoveLP > 0) {
  //     const moveLPDeposits = fromWei(
  //       state.treasuryReceipt.totalDepositsMoveLP,
  //       getMoveWethLPAssetData(rootState.account.networkInfo.network).decimals
  //     );
  //     moveLPDepositsNative = multiply(moveLPDeposits, getters.slpNativePrice);
  //   }
  //
  //   return add(moveDepositsNative, moveLPDepositsNative);
  // },
  // treasuryMonthWithdrewNative(state, getters, rootState): string {
  //   if (
  //     state.isTreasuryReceiptLoading ||
  //     state.treasuryReceipt === undefined ||
  //     rootState.account?.networkInfo === undefined
  //   ) {
  //     return '0';
  //   }
  //
  //   let moveWithdrawalsNative = '0';
  //   if (state.treasuryReceipt.totalWithdrawalsMove > 0) {
  //     const moveWithdrawals = fromWei(
  //       state.treasuryReceipt.totalWithdrawalsMove,
  //       getMoveAssetData(rootState.account.networkInfo.network).decimals
  //     );
  //     moveWithdrawalsNative = multiply(
  //       moveWithdrawals,
  //       getters.moveNativePrice
  //     );
  //   }
  //
  //   let moveLPWithdrawalsNative = '0';
  //   if (state.treasuryReceipt.totalWithdrawalsMoveLP > 0) {
  //     const moveLPWithdrawals = fromWei(
  //       state.treasuryReceipt.totalWithdrawalsMoveLP,
  //       getMoveWethLPAssetData(rootState.account.networkInfo.network).decimals
  //     );
  //     moveLPWithdrawalsNative = multiply(
  //       moveLPWithdrawals,
  //       getters.slpNativePrice
  //     );
  //   }
  //
  //   return add(moveWithdrawalsNative, moveLPWithdrawalsNative);
  // },
  // treasuryMonthBonusesUsed(state, _, rootState): string {
  //   if (
  //     state.treasuryReceipt === undefined ||
  //     state.isTreasuryReceiptLoading ||
  //     rootState.account?.networkInfo === undefined ||
  //     state.treasuryReceipt.spentThisMonth === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   return fromWei(
  //     state.treasuryReceipt.spentThisMonth,
  //     getUSDCAssetData(rootState.account.networkInfo.network).decimals
  //   );
  // },
  // treasuryMonthBonusesUsedNative(state, getters): string {
  //   return multiply(getters.treasuryMonthBonusesUsed, getters.usdcNativePrice);
  // },
  // treasuryMonthAvgDailyEarnings(state, _, rootState): string {
  //   if (
  //     state.treasuryReceipt === undefined ||
  //     state.isTreasuryReceiptLoading ||
  //     rootState.account?.networkInfo === undefined ||
  //     state.treasuryReceipt.avgDailyEarnings === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   return fromWei(
  //     state.treasuryReceipt.avgDailyEarnings,
  //     getUSDCAssetData(rootState.account.networkInfo.network).decimals
  //   );
  // },
  // treasuryMonthAvgDailyEarningsNative(state, getters): string {
  //   return multiply(
  //     getters.treasuryMonthAvgDailyEarnings,
  //     getters.usdcNativePrice
  //   );
  // },
  // treasuryMonthAvgDailySpendings(state, _, rootState): string {
  //   if (
  //     state.treasuryReceipt === undefined ||
  //     state.isTreasuryReceiptLoading ||
  //     rootState.account?.networkInfo === undefined ||
  //     state.treasuryReceipt.avgDailySpendings === 0
  //   ) {
  //     return '0';
  //   }
  //
  //   return fromWei(
  //     state.treasuryReceipt.avgDailySpendings,
  //     getUSDCAssetData(rootState.account.networkInfo.network).decimals
  //   );
  // },
  // treasuryMonthAvgDailySpendingsNative(state, getters): string {
  //   return multiply(
  //     getters.treasuryMonthAvgDailySpendings,
  //     getters.usdcNativePrice
  //   );
  // },
  moveNativePrice(state, _, rootState, rootGetters): string {
    return rootGetters['account/usdcNativePrice'];
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
