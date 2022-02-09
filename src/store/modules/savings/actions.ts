import * as Sentry from '@sentry/vue';

import { getSavingsAPY, getSavingsBalance } from '@/services/chain';
import { getSavingsInfo, getSavingsReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import {
  getFromPersistStoreWithExpire,
  setToPersistStore
} from '@/settings/persist/utils';
import { checkAccountStateIsReady } from '@/store/modules/account/utils/state';
import { GetterType } from '@/store/modules/savings/getters';
import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import {
  SavingsGetReceiptPayload,
  SavingsStoreState,
  SetSavingsReceiptPayload
} from './types';

type Actions = {
  restoreReceipts: Promise<void>;
  loadMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
  fetchSavingsFreshData: Promise<void>;
  fetchSavingsInfo: Promise<void>;
  fetchSavingsReceipt: void;
};

export const RECEIPT_TIME_EXPIRE = 60 * 10 * 1000;

const actions: ActionFuncs<
  Actions,
  SavingsStoreState,
  MutationType,
  GetterType
> = {
  async restoreReceipts({ commit }): Promise<void> {
    const end = new Date();
    end.setMonth(end.getMonth() - 12);
    for (
      let i = new Date();
      i.getTime() > end.getTime();
      i.setMonth(i.getMonth() - 1)
    ) {
      const receipt = await getFromPersistStoreWithExpire(
        'savingsReceipts',
        `${i.getFullYear()}/${i.getMonth() + 1}`
      );
      if (receipt !== undefined) {
        commit('setSavingsReceipt', {
          year: i.getFullYear(),
          month: i.getMonth() + 1,
          receipt: Promise.resolve(receipt)
        } as SetSavingsReceiptPayload);
      }
    }
  },
  async loadMinimalInfo({ dispatch }): Promise<void> {
    const savingsFreshDataPromise = dispatch('fetchSavingsFreshData');
    const restoreReceiptsPromise = dispatch('restoreReceipts');

    const promisesResults = await Promise.allSettled([
      savingsFreshDataPromise,
      restoreReceiptsPromise
    ]);

    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      Sentry.captureException(promisesErrors);
    }
  },
  async loadInfo({ dispatch }): Promise<void> {
    const loadMinimalInfoPromise = dispatch('loadMinimalInfo');
    const savingsInfoPromise = dispatch('fetchSavingsInfo');

    const promisesResults = await Promise.allSettled([
      savingsInfoPromise,
      loadMinimalInfoPromise
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
      console.error(`can't get savings fresh data:`, err);
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
  fetchSavingsReceipt(
    { commit, state, rootState, getters },
    { year, month }: SavingsGetReceiptPayload
  ): void {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    if (getters.savingsReceipt(year, month) !== undefined) {
      return;
    }

    const receiptPromise = getSavingsReceipt(
      rootState.account!.currentAddress!,
      year,
      month
    ).then((item) => {
      if (item.isError) {
        throw new Error(item.error);
      }

      return item.result;
    });

    commit('setSavingsReceipt', {
      year: year,
      month: month,
      receipt: receiptPromise
    } as SetSavingsReceiptPayload);

    (async () => {
      for (const [key, value] of state.receipts.entries()) {
        if (value !== undefined) {
          await setToPersistStore(
            'savingsReceipts',
            key,
            await value.data,
            Date.now() + RECEIPT_TIME_EXPIRE
          );
        }
      }
    })().then();
  }
};

export type ActionType = typeof actions;
export default actions;
