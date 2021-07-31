import { AccountStoreState } from '@/store/modules/account/types';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { getSavingsInfo, getSavingsReceipt } from '@/services/mover';
import { getSavingsAPY, getSavingsBalance } from '@/services/chain';
import { isError } from '@/services/responses';

export type SavingsGetReceiptPayload = {
  year: number;
  month: number;
};

export default {
  async fetchSavingsFreshData({ commit, state }): Promise<void> {
    if (
      state.currentAddress === undefined ||
      state.networkInfo === undefined ||
      state.provider === undefined
    ) {
      return;
    }

    try {
      const getSavingsApyPromise = getSavingsAPY(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
      );

      const getSavingsBalancePromise = getSavingsBalance(
        state.currentAddress,
        state.networkInfo.network,
        state.provider.web3
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
      commit('setSavingsAPY', '0');
      commit('setSavingsDPY', '0');
      commit('setSavingsBalance', '0');
    }
  },
  async fetchSavingsInfo({ commit, state }): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    commit('setIsSavingsInfoLoading', true);
    commit('setSavingsInfoError', undefined);
    commit('setSavingsInfo', undefined);

    const info = await getSavingsInfo(state.currentAddress);

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
    { year, month }: SavingsGetReceiptPayload
  ): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    commit('setIsSavingsReceiptLoading', true);
    commit('setSavingsReceiptError', undefined);
    commit('setSavingsReceipt', undefined);

    const receipt = await getSavingsReceipt(state.currentAddress, year, month);

    if (isError(receipt)) {
      commit('setSavingsReceiptError', receipt.error);
      commit('setIsSavingsReceiptLoading', false);
      return;
    }

    commit('setSavingsReceipt', receipt.result);
    commit('setIsSavingsReceiptLoading', false);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
