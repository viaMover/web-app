import * as Sentry from '@sentry/vue';

import {
  getPowercardState,
  getTotalStakedMove,
  getTotalStakedMoveEthLP,
  getTreasuryAPY,
  getTreasuryBalance,
  getTreasuryBonus,
  powercardBalance
} from '@/services/chain';
import { getPowercardTimings } from '@/services/chain/treasury/powercard';
import { getTreasuryInfo, getTreasuryReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import { checkAccountStateIsReady } from '@/store/modules/account/utils/state';
import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import { TreasuryGetReceiptPayload, TreasuryStoreState } from './types';

enum Actions {
  loadMinimalInfo,
  loadInfo,
  fetchPowercardData,
  fetchTreasuryFreshData,
  fetchTreasuryInfo,
  fetchTreasuryReceipt
}

const actions: ActionFuncs<typeof Actions, TreasuryStoreState, MutationType> = {
  async loadMinimalInfo({ dispatch }): Promise<void> {
    const loadPowercardPromise = dispatch('fetchPowercardData');
    const treasuryFreshData = dispatch('fetchTreasuryFreshData');

    const promisesResults = await Promise.allSettled([
      treasuryFreshData,
      loadPowercardPromise
    ]);

    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      Sentry.captureException(promisesErrors);
    }
  },
  async loadInfo({ dispatch }): Promise<void> {
    const loadPowercardPromise = dispatch('fetchPowercardData');
    const treasuryFreshData = dispatch('fetchTreasuryFreshData');
    const treasuryInfoPromise = dispatch('fetchTreasuryInfo');

    const promisesResults = await Promise.allSettled([
      treasuryFreshData,
      loadPowercardPromise,
      treasuryInfoPromise
    ]);

    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      Sentry.captureException(promisesErrors);
    }
  },
  async fetchPowercardData({ commit, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    const powercardBalanceData = await powercardBalance(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    commit('setPowercardBalance', powercardBalanceData);

    const getPowercardStateData = await getPowercardState(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    commit('setPowercardState', getPowercardStateData);

    if (getPowercardStateData === 'Staked') {
      const getPowercardTimingsData = await getPowercardTimings(
        rootState.account!.currentAddress!,
        rootState.account!.networkInfo!.network,
        rootState.account!.provider!.web3
      );

      commit('setPowercardActiveTime', getPowercardTimingsData.activeTime);
      commit('setPowercardCooldownTime', getPowercardTimingsData.cooldownTime);
    }
  },
  async fetchTreasuryFreshData({ commit, getters, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    const getTreasuryBalancesPromise = getTreasuryBalance(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTreasuryBonusPromise = getTreasuryBonus(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTreasuryAPYPromise = getTreasuryAPY(
      getters.usdcNativePrice,
      getters.moveNativePrice,
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTotalStakedMovePromise = getTotalStakedMove(
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTotalStakedMoveEthLPPromise = getTotalStakedMoveEthLP(
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
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
  async fetchTreasuryInfo({ commit, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    commit('setIsTreasuryInfoLoading', true);
    commit('setTreasuryInfoError', undefined);
    commit('setTreasuryInfo', undefined);

    const info = await getTreasuryInfo(rootState.account!.currentAddress!);

    if (isError(info)) {
      commit('setTreasuryInfoError', info.error);
      commit('setIsTreasuryInfoLoading', false);
      Sentry.captureException(`can't get treasury info: ${info.error}`);
      return;
    }

    commit('setTreasuryInfo', info.result);
    commit('setIsTreasuryInfoLoading', false);
  },
  async fetchTreasuryReceipt(
    { commit, state, rootState },
    { year, month }: TreasuryGetReceiptPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
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

    const receipt = await getTreasuryReceipt(
      rootState.account!.currentAddress!,
      year,
      month
    );

    if (isError(receipt)) {
      commit('setTreasuryReceiptError', receipt.error);
      commit('setIsTreasuryReceiptLoading', false);
      Sentry.captureException(`can't get treasury receipt: ${receipt.error}`);
      return;
    }

    commit('setTreasuryReceipt', receipt.result);
    commit('setIsTreasuryReceiptLoading', false);
  }
};

export type ActionType = typeof actions;
export default actions;
