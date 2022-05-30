import * as Sentry from '@sentry/vue';

import { MoverAPISavingsPlusService } from '@/services/v2/api/mover/savings-plus';
import { SavingsPlusOnChainService } from '@/services/v2/on-chain/mover/savings-plus';
import { getFromPersistStoreWithExpire } from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';
import { divide, fromWei, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { getUSDCAssetData } from '@/wallet/references/data';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  ensureAPIServiceExists,
  ensureOnChainServiceExists,
  SavingsPlusGetReceiptPayload,
  SavingsPlusStoreState,
  SetSavingsPlusReceiptPayload
} from './types';

type Actions = {
  restoreReceipts: Promise<void>;
  loadInfo: Promise<void>;
  fetchSavingsInfo: Promise<void>;
  getReceipt: Promise<void>;
  setOnChainService: void;
  setAPIService: void;
};

export const RECEIPT_TIME_EXPIRE = 10 * 60 * 1000; // 10 min

const actions: ActionFuncs<
  Actions,
  SavingsPlusStoreState,
  MutationType,
  GetterType
> = {
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
  async getReceipt(
    { state, commit, getters, rootState },
    { year, month }: SavingsPlusGetReceiptPayload
  ): Promise<void> {
    if (!ensureAPIServiceExists(state)) {
      console.warn('API service does not exist in store');
      return;
    }

    if (getters.savingsReceipt(year, month) !== undefined) {
      return;
    }

    const receiptPromise = state.apiService.getReceipt(year, month);

    commit('setSavingsReceipt', {
      year: year,
      month: month,
      receipt: receiptPromise
    } as SetSavingsPlusReceiptPayload);

    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }
  },
  async loadInfo({ dispatch }): Promise<void> {
    await dispatch('restoreReceipts');
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

      if (!ensureOnChainServiceExists(state)) {
        console.warn('On chain service does not exist in store');
        return;
      }

      if (getters.info !== undefined) {
        return;
      }

      commit('setIsSavingsInfoLoading', true);
      commit('setSavingsInfo', undefined);

      const info = await state.apiService.getInfo();

      commit('setSavingsInfo', info);
      commit('setSavingsAPY', multiply(info.avg30DaysAPY, 100));
      commit('setSavingsDPY', multiply(divide(info.avg30DaysAPY, 365), 100));
      if (rootState.account?.networkInfo?.network === Network.polygon) {
        const savingsBalance = await state.onChainService.getSavingsBalance();
        commit('setSavingsBalance', savingsBalance);
      } else if (rootState.account?.networkInfo !== undefined) {
        commit(
          'setSavingsBalance',
          fromWei(
            info.currentBalance,
            getUSDCAssetData(rootState.account.networkInfo.network).decimals
          )
        );
      }
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
