import * as Sentry from '@sentry/vue';

import {
  MoverAPISavingsService,
  SavingsReceipt
} from '@/services/v2/api/mover/savings';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import {
  getFromPersistStoreWithExpire,
  setToPersistStore
} from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { GetterType } from '@/store/modules/savings/getters';
import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import {
  ensureAPIServiceExists,
  ensureOnChainServiceExists,
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
  fetchSavingsReceipt: Promise<SavingsReceipt>;
  setOnChainService: void;
  setAPIService: void;
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
      console.warn('Failed to load Savings minimal info', error);
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
      console.warn('Failed to load savings info', promisesErrors);
      Sentry.captureException(promisesErrors);
    }
  },
  async fetchSavingsFreshData({ commit, state }): Promise<void> {
    try {
      if (!ensureOnChainServiceExists(state)) {
        console.warn('On-chain service does not exist in store');
        return;
      }

      const [savingsAPY, savingsBalance] = await Promise.all([
        state.onChainService.getSavingsAPY(),
        state.onChainService.getSavingsBalance()
      ]);

      commit('setSavingsAPY', savingsAPY.apy);
      commit('setSavingsDPY', savingsAPY.dpy);
      commit('setSavingsBalance', savingsBalance);
    } catch (error) {
      commit('setSavingsAPY', '0');
      commit('setSavingsDPY', '0');
      commit('setSavingsBalance', '0');
      console.error('Failed to fetch Savings fresh data', error);
      Sentry.captureException(error);
    }
  },
  async fetchSavingsInfo({ commit, rootState, state, getters }): Promise<void> {
    try {
      if (!ensureAPIServiceExists(state)) {
        console.warn('API service does not exist in store');
        return;
      }

      if (getters.savingsInfo !== undefined) {
        return;
      }

      commit('setIsSavingsInfoLoading', true);
      commit('setSavingsInfo', undefined);

      const info = await state.apiService.getInfo();

      commit('setSavingsInfo', info);

      if (ensureAccountStateIsSafe(rootState.account)) {
        setToPersistStore(
          rootState.account.currentAddress,
          'savings',
          'info',
          info,
          INFO_TIME_EXPIRE
        );
      }
    } catch (error) {
      console.error('Failed to fetch Savings info', error);
      Sentry.captureException(error);
    } finally {
      commit('setIsSavingsInfoLoading', false);
    }
  },
  fetchSavingsReceipt(
    { commit, state, rootState, getters },
    { year, month }: SavingsGetReceiptPayload
  ): Promise<SavingsReceipt> {
    if (!ensureAPIServiceExists(state)) {
      throw new Error('API service does not exist in store');
    }

    const getterValue = getters.savingsReceipt(year, month);
    if (getterValue !== undefined) {
      return getterValue;
    }

    const receiptPromise = state.apiService.getReceipt(year, month);

    commit('setSavingsReceipt', {
      year: year,
      month: month,
      receipt: receiptPromise
    } as SetSavingsReceiptPayload);

    if (!ensureAccountStateIsSafe(rootState.account)) {
      return receiptPromise;
    }

    (async () => {
      for (const [key, value] of state.receipts.entries()) {
        if (value !== undefined) {
          try {
            await setToPersistStore(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              rootState.account!.currentAddress!,
              'savingsReceipts',
              key,
              await value.data,
              RECEIPT_TIME_EXPIRE
            );
          } catch (error) {
            addSentryBreadcrumb({
              type: 'error',
              category: 'savings.store',
              message: 'An error occurred during setToPersistStore()',
              data: {
                error
              }
            });
          }
        }
      }
    })();

    return receiptPromise;
  },
  setOnChainService({ commit }, service: SavingsOnChainService): void {
    commit('setOnChainService', service);
  },
  setAPIService({ commit }, service: MoverAPISavingsService): void {
    commit('setAPIService', service);
  }
};

export type ActionType = typeof actions;
export default actions;
