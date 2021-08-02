import { AccountStoreState } from '@/store/modules/account/types';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { GetSavingsApy, getSavingsBalance } from '@/services/mover/savings';

export default {
  async fetchSavingsFreshData({ commit, state }): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    if (state.networkInfo === undefined) {
      return;
    }

    if (state.provider === undefined) {
      return;
    }

    const apy = undefined;
    const dpy = undefined;
    try {
      const getSavingsApyPromise = GetSavingsApy(
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
  }
} as ActionTree<AccountStoreState, RootStoreState>;
