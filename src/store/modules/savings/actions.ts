import * as Sentry from '@sentry/vue';

import { getSavingsAPY, getSavingsBalance } from '@/services/chain';
import { getSavingsInfo, getSavingsReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import {
  getFromPersistStoreWithExpire,
  setToPersistStore
} from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { GetterType } from '@/store/modules/savings/getters';
import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import {
  SavingsGetReceiptPayload,
  SavingsStoreState,
  SetSavingsReceiptPayload
} from './types';

type Actions = {
  restoreInfo: Promise<void>;
  restoreReceipts: Promise<void>;
  loadMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
  fetchSavingsFreshData: Promise<void>;
  fetchSavingsInfo: Promise<void>;
  fetchSavingsReceipt: void;
};

export const RECEIPT_TIME_EXPIRE = 10 * 60 * 1000; // 10 min
export const INFO_TIME_EXPIRE = 5 * 60 * 1000; // 5 min

const actions: ActionFuncs<
  Actions,
  SavingsStoreState,
  MutationType,
  GetterType
> = {
  async restoreInfo({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    const info = await getFromPersistStoreWithExpire(
      rootState.account.currentAddress,
      'savings',
      'info'
    );
    if (info !== undefined) {
      commit('setSavingsInfo', info);
    }
  },
  async restoreReceipts({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    const end = new Date();
    end.setMonth(end.getMonth() - 12);
    for (
      let i = new Date();
      i.getTime() > end.getTime();
      i.setMonth(i.getMonth() - 1)
    ) {
      const receipt = await getFromPersistStoreWithExpire(
        rootState.account.currentAddress,
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
    try {
      await dispatch('fetchSavingsFreshData');
    } catch (error) {
      console.warn('failed to load savings minimal info', error);
      Sentry.captureException(error);
    }
  },
  async loadInfo({ dispatch }): Promise<void> {
    await dispatch('restoreReceipts');
    await dispatch('restoreInfo');

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
      console.warn('failed to load savings info', promisesErrors);
      Sentry.captureException(promisesErrors);
    }
  },
  async fetchSavingsFreshData({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const getSavingsApyPromise = getSavingsAPY(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      const getSavingsBalancePromise = getSavingsBalance(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
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
  async fetchSavingsInfo({ commit, rootState, getters }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    if (getters.savingsInfo !== undefined) {
      commit('setIsSavingsInfoLoading', false);
      return;
    }

    commit('setIsSavingsInfoLoading', true);
    commit('setSavingsInfo', undefined);

    const info = await getSavingsInfo(rootState.account.currentAddress);

    if (isError(info)) {
      commit('setIsSavingsInfoLoading', false);
      Sentry.captureException(`can't get savings info: ${info.error}`);
      return;
    }

    commit('setSavingsInfo', info.result);
    commit('setIsSavingsInfoLoading', false);

    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    setToPersistStore(
      rootState.account.currentAddress,
      'savings',
      'info',
      info.result,
      INFO_TIME_EXPIRE
    );
  },
  fetchSavingsReceipt(
    { commit, state, rootState, getters },
    { year, month }: SavingsGetReceiptPayload
  ): void {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    if (getters.savingsReceipt(year, month) !== undefined) {
      return;
    }

    const receiptPromise = getSavingsReceipt(
      rootState.account.currentAddress,
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

    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    (async () => {
      for (const [key, value] of state.receipts.entries()) {
        if (value !== undefined) {
          await setToPersistStore(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            rootState.account!.currentAddress!,
            'savingsReceipts',
            key,
            await value.data,
            RECEIPT_TIME_EXPIRE
          );
        }
      }
    })();
  }
};

export type ActionType = typeof actions;
export default actions;
