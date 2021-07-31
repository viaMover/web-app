import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { AccountStoreState } from '@/store/modules/account/types';

import { getTreasuryInfo, getTreasuryReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import {
  getTotalStakedMove,
  getTotalStakedMoveEthLP,
  getTreasuryAPY,
  getTreasuryBalance,
  getTreasuryBonus
} from '@/services/chain';

export type TreasuryGetReceiptPayload = {
  year: number;
  month: number;
};

export default {
  async fetchTreasuryFreshData({ commit, state, getters }): Promise<void> {
    if (
      state.currentAddress === undefined ||
      state.networkInfo === undefined ||
      state.provider === undefined
    ) {
      return;
    }

    const getTreasuryBalancesPromise = getTreasuryBalance(
      state.currentAddress,
      state.networkInfo.network,
      state.provider.web3
    );

    const getTreasuryBonusPromise = getTreasuryBonus(
      state.currentAddress,
      state.networkInfo.network,
      state.provider.web3
    );

    const getTreasuryAPYPromise = getTreasuryAPY(
      getters.usdcNativePrice,
      getters.moveNativePrice,
      state.currentAddress,
      state.networkInfo.network,
      state.provider.web3
    );

    const getTotalStakedMovePromise = getTotalStakedMove(
      state.networkInfo.network,
      state.provider.web3
    );

    const getTotalStakedMoveEthLPPromise = getTotalStakedMoveEthLP(
      state.networkInfo.network,
      state.provider.web3
    );

    const [
      treasuryBalances,
      treasuryBonus,
      treasuryAPY,
      treasuryTotalStakedMove,
      treasuryTotalStakedMoveEthLP
    ] = await Promise.all([
      getTreasuryBalancesPromise,
      getTreasuryBonusPromise,
      getTreasuryAPYPromise,
      getTotalStakedMovePromise,
      getTotalStakedMoveEthLPPromise
    ]);

    commit('setTreasuryBalanceMove', treasuryBalances.MoveBalance);
    commit('setTreasuryBalanceLP', treasuryBalances.LPBalance);
    commit('setTreasuryBonus', treasuryBonus);
    commit('setTreasuryAPY', treasuryAPY);
    commit('setTreasuryTotalStakedMove', treasuryTotalStakedMove);
    commit('setTreasuryTotalStakedMoveEthLP', treasuryTotalStakedMoveEthLP);
  },
  async fetchTreasuryInfo({ commit, state }): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    commit('setIsTreasuryInfoLoading', true);
    commit('setTreasuryInfoError', undefined);
    commit('setTreasuryInfo', undefined);

    const info = await getTreasuryInfo(state.currentAddress);

    if (isError(info)) {
      commit('setTreasuryInfoError', info.error);
      commit('setIsTreasuryInfoLoading', false);

      return;
    }

    commit('setTreasuryInfo', info.result);
    commit('setIsTreasuryInfoLoading', false);
  },
  async fetchTreasuryReceipt(
    { commit, state },
    { year, month }: TreasuryGetReceiptPayload
  ): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    if (
      state.treasuryReceipt !== undefined &&
      state.treasuryReceiptError === undefined &&
      state.treasuryReceipt.hourlyBalances[0].year === year &&
      state.treasuryReceipt.hourlyBalances[0].month === month
    ) {
      return;
    }

    commit('setIsTreasuryReceiptLoading', true);
    commit('setTreasuryReceiptError', undefined);
    commit('setTreasuryReceipt', undefined);

    const receipt = await getTreasuryReceipt(state.currentAddress, year, month);

    if (isError(receipt)) {
      commit('setTreasuryReceiptError', receipt.error);
      commit('setIsTreasuryReceiptLoading', false);

      return;
    }

    commit('setTreasuryReceipt', receipt.result);
    commit('setIsTreasuryReceiptLoading', false);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
