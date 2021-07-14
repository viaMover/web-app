import { AccountStoreState } from '@/store/modules/account/types';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { GetSavingsApy } from '@/services/mover/savings';

export default {
  async fetchSavingsAPY({ commit, state }): Promise<void> {
    if (state.currentAddress === undefined) {
      return;
    }

    if (state.networkInfo === undefined) {
      return;
    }

    if (state.provider === undefined) {
      return;
    }

    let apy = undefined;
    let dpy = undefined;
    try {
      const response = await GetSavingsApy(
        state.currentAddress,
        state.networkInfo?.network,
        state.provider?.web3
      );
      apy = response.apy;
      dpy = response.dpy;
    } catch (err) {
      console.error(`can't get apy: ${err}`);
    }

    commit('setSavingsAPY', apy);
    commit('setSavingsDPY', dpy);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
