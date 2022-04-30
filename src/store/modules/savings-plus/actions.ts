import * as Sentry from '@sentry/vue';

import {
  MoverAPISavingsPlusService,
  SavingsPlusInfo
} from '@/services/v2/api/mover/savings-plus';
import { SavingsPlusOnChainService } from '@/services/v2/on-chain/mover/savings-plus';
import { getFromPersistStoreWithExpire } from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';
import { divide, fromWei, multiply } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  ensureAPIServiceExists,
  SavingsPlusStoreState,
  SetSavingsPlusReceiptPayload
} from './types';

type Actions = {
  restoreInfo: Promise<void>;
  restoreReceipts: Promise<void>;
  loadInfo: Promise<void>;
  fetchSavingsInfo: Promise<void>;
  setOnChainService: void;
  setAPIService: void;
};

export const RECEIPT_TIME_EXPIRE = 10 * 60 * 1000; // 10 min
export const INFO_TIME_EXPIRE = 1 * 60 * 1000; // 5 min

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

    const info = await getFromPersistStoreWithExpire<SavingsPlusInfo>(
      rootState.account.currentAddress,
      'savingsPlus',
      'info'
    );
    if (info !== undefined) {
      commit('setSavingsInfo', info);

      const dpy = divide(info.avg30DaysAPY, 30);

      commit('setSavingsInfo', info);
      commit('setSavingsAPY', multiply(dpy, 365));
      commit('setSavingsDPY', dpy);
      if (rootState.account?.networkInfo !== undefined) {
        commit(
          'setSavingsBalance',
          fromWei(
            info.currentBalance,
            getUSDCAssetData(rootState.account.networkInfo.network).decimals
          )
        );
      }
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
  async loadInfo({ dispatch }): Promise<void> {
    await dispatch('restoreReceipts');
    await dispatch('restoreInfo');
    try {
      await dispatch('fetchSavingsInfo');
    } catch (err) {
      console.warn('Failed to load savings info', err);
      Sentry.captureException(err);
    }
  },
  async fetchSavingsInfo({ commit, rootState, state, getters }): Promise<void> {
    try {
      if (!ensureAPIServiceExists(state)) {
        console.warn('API service does not exist in store');
        return;
      }

      if (getters.info !== undefined) {
        return;
      }

      commit('setIsSavingsInfoLoading', true);
      commit('setSavingsInfo', undefined);

      const info = await state.apiService.getInfo();

      const dpy = divide(info.avg30DaysAPY, 30);

      commit('setSavingsInfo', info);
      commit('setSavingsAPY', multiply(dpy, 365));
      commit('setSavingsDPY', dpy);
      if (rootState.account?.networkInfo !== undefined) {
        commit(
          'setSavingsBalance',
          fromWei(
            info.currentBalance,
            getUSDCAssetData(rootState.account.networkInfo.network).decimals
          )
        );
      }

      // if (ensureAccountStateIsSafe(rootState.account)) {
      //   setToPersistStore(
      //     rootState.account.currentAddress,
      //     'savingsPlus',
      //     'info',
      //     info,
      //     INFO_TIME_EXPIRE
      //   );
      // }
    } catch (error) {
      console.error('Failed to fetch Savings info', error);
      Sentry.captureException(error);
      commit('setSavingsAPY', '0');
      commit('setSavingsDPY', '0');
      commit('setSavingsBalance', '0');
    } finally {
      commit('setIsSavingsInfoLoading', false);
    }
  },
  setOnChainService({ commit }, service: SavingsPlusOnChainService): void {
    commit('setOnChainService', service);
  },
  setAPIService({ commit }, service: MoverAPISavingsPlusService): void {
    commit('setAPIService', service);
  }
};

export type ActionType = typeof actions;
export default actions;
