import * as Sentry from '@sentry/vue';

import { getFromPersistStoreWithExpire } from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import { SavingsPlusStoreState, SetSavingsPlusReceiptPayload } from './types';

type Actions = {
  restoreInfo: Promise<void>;
  restoreReceipts: Promise<void>;
  loadMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
};

export const RECEIPT_TIME_EXPIRE = 10 * 60 * 1000; // 10 min
export const INFO_TIME_EXPIRE = 5 * 60 * 1000; // 5 min

const actions: ActionFuncs<
  Actions,
  SavingsPlusStoreState,
  MutationType,
  GetterType
> = {
  async restoreInfo({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    const info = await getFromPersistStoreWithExpire(
      rootState.account.currentAddress,
      'savingsPlus',
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
        'savingsPlusReceipts',
        `${i.getFullYear()}/${i.getMonth() + 1}`
      );
      if (receipt !== undefined) {
        commit('setSavingsReceipt', {
          year: i.getFullYear(),
          month: i.getMonth() + 1,
          receipt: Promise.resolve(receipt)
        } as SetSavingsPlusReceiptPayload);
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
  }
};

export type ActionType = typeof actions;
export default actions;
