import { AccountStoreState } from '@/store/modules/account/types';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { GetSavingsInfo, GetSavingsReceipt } from '@/services/mover';
import { isError } from '@/services/responses';

export type EmitChartRequestPayload = {
  assetCode: string;
  nativeCurrency: string;
  ChartTypes: string;
};

export type GetSavingsReceiptPayload = {
  year: number;
  month: number;
};

export default {
  emitChartRequest({ state }, payload: EmitChartRequestPayload): void {
    try {
      state.explorer?.GetChartData(
        payload.assetCode,
        payload.nativeCurrency,
        payload.ChartTypes
      );
    } catch (err) {
      console.error(`Can't get chart data: ${err}`);
    }
  },
  async fetchSavingsInfo({ commit, state }): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    commit('setIsSavingsInfoLoading', true);
    commit('setSavingsInfoError', undefined);
    commit('setSavingsInfo', undefined);

    const info = await GetSavingsInfo(state.currentAddress);

    if (isError(info)) {
      commit('setSavingsInfoError', info.error);
      commit('setIsSavingsInfoLoading', false);

      return;
    }

    commit('setSavingsInfo', info.result);
    commit('setIsSavingsInfoLoading', false);
  },
  async fetchSavingsReceipt(
    { commit, state },
    { year, month }: GetSavingsReceiptPayload
  ): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    if (
      state.savingsReceipt !== undefined &&
      state.savingsReceiptError === undefined &&
      state.savingsReceipt.hourlyBalances[0].year === year &&
      state.savingsReceipt.hourlyBalances[0].month === month
    ) {
      return;
    }

    commit('setIsSavingsReceiptLoading', true);
    commit('setSavingsReceiptError', undefined);
    commit('setSavingsReceipt', undefined);

    const receipt = await GetSavingsReceipt(state.currentAddress, year, month);

    if (isError(receipt)) {
      commit('setSavingsReceiptError', receipt.error);
      commit('setIsSavingsReceiptLoading', false);

      return;
    }

    commit('setSavingsReceipt', receipt.result);
    commit('setIsSavingsReceiptLoading', false);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
