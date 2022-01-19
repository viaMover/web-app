import * as Sentry from '@sentry/vue';

import { getSavingsAPY, getSavingsBalance } from '@/services/chain';
import { getSavingsInfo, getSavingsReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import { checkAccountStateIsReady } from '@/store/modules/account/utils/state';
import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import { SavingsGetReceiptPayload, SavingsStoreState } from './types';

enum Actions {
  loadMinimalInfo,
  loadInfo,
  fetchSavingsFreshData,
  fetchSavingsInfo,
  fetchSavingsReceipt
}

const actions: ActionFuncs<typeof Actions, SavingsStoreState, MutationType> = {
  async loadMinimalInfo({ dispatch }): Promise<void> {
    await dispatch('fetchSavingsFreshData');
  },
  async loadInfo({ dispatch }): Promise<void> {
    const savingsFreshData = dispatch('fetchSavingsFreshData');
    const savingsInfoPromise = dispatch('fetchSavingsInfo');

    const promisesResults = await Promise.allSettled([
      savingsInfoPromise,
      savingsFreshData
    ]);

    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      Sentry.captureException(promisesErrors);
    }
  },
  async fetchSavingsFreshData({ commit, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    try {
      const getSavingsApyPromise = getSavingsAPY(
        rootState.account!.currentAddress!,
        rootState.account!.networkInfo!.network,
        rootState.account!.provider!.web3
      );

      const getSavingsBalancePromise = getSavingsBalance(
        rootState.account!.currentAddress!,
        rootState.account!.networkInfo!.network,
        rootState.account!.provider!.web3
      );

      const [savingsAPY, savingsBalance] = await Promise.all([
        getSavingsApyPromise,
        getSavingsBalancePromise
      ]);

      commit('setSavingsAPY', savingsAPY.apy);
      commit('setSavingsDPY', savingsAPY.dpy);
      commit('setSavingsBalance', savingsBalance);
    } catch (err) {
      console.error(`can't get savings fresh data: ${err}`);
      Sentry.captureException(err);
      commit('setSavingsAPY', '0');
      commit('setSavingsDPY', '0');
      commit('setSavingsBalance', '0');
    }
  },
  async fetchSavingsInfo({ commit, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    commit('setIsSavingsInfoLoading', true);
    commit('setSavingsInfoError', undefined);
    commit('setSavingsInfo', undefined);

    const info = await getSavingsInfo(rootState.account!.currentAddress!);

    if (isError(info)) {
      commit('setSavingsInfoError', info.error);
      commit('setIsSavingsInfoLoading', false);
      Sentry.captureException(`can't get savings info: ${info.error}`);
      return;
    }

    commit('setSavingsInfo', info.result);
    commit('setIsSavingsInfoLoading', false);
  },
  async fetchSavingsReceipt(
    { commit, state, rootState },
    { year, month }: SavingsGetReceiptPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    if (
      !state.isSavingsReceiptLoading &&
      state.savingsReceipt !== undefined &&
      state.savingsReceipt.hourlyBalances.length > 0
    ) {
      const { year: loadedYear, month: loadedMonth } =
        state.savingsReceipt.hourlyBalances[0];

      if (month === loadedMonth && year === loadedYear) {
        return;
      }
    }

    commit('setIsSavingsReceiptLoading', true);
    commit('setSavingsReceiptError', undefined);
    commit('setSavingsReceipt', undefined);

    const receipt = await getSavingsReceipt(
      rootState.account!.currentAddress!,
      year,
      month
    );

    if (isError(receipt)) {
      commit('setSavingsReceiptError', receipt.error);
      commit('setIsSavingsReceiptLoading', false);
      Sentry.captureException(`can't get savings receipt: ${receipt.error}`);
      return;
    }

    commit('setSavingsReceipt', receipt.result);
    commit('setIsSavingsReceiptLoading', false);
  }
};

export type ActionType = typeof actions;
export default actions;
