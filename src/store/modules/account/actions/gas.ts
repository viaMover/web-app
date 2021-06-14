import { getGasPrices } from '@/wallet/gas';
import { AccountStoreState } from '@/store/modules/account/types';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';

const GAS_UPDATE_INTERVAL = 10000; // 10s
const GAS_INITIAL_DELAY = 3000; // 3s to reduce the chance to reach the  rate limit of etherscan in case of page reload

export default {
  startGasListening({ commit, state }): void {
    commit('setGasUpdating', true);

    const updateGasFunc = async () => {
      try {
        const resp = await getGasPrices(state.networkInfo?.network);
        commit('setGasPrices', resp);
      } catch (err) {
        commit('setRefreshEror', err);
        console.log(`Can't get gas prices, err: ${err}`);
      } finally {
        if (state.gasUpdating) {
          setTimeout(updateGasFunc, GAS_UPDATE_INTERVAL);
        }
      }
    };

    setTimeout(updateGasFunc, GAS_INITIAL_DELAY);
  },
  stopGasListening({ commit }): void {
    commit('setGasUpdating', false);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
