import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { AccountStoreState } from '@/store/modules/account/types';

import { getTreasuryInfo, getTreasuryReceipt } from '@/services/mover';
import { isError } from '@/services/responses';

export type TreasuryGetReceiptPayload = {
  year: number;
  month: number;
};

export default {
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
