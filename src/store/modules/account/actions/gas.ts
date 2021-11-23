import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import { getGasPrices } from '@/wallet/gas';

const GAS_UPDATE_INTERVAL = 60000; // 60s
const GAS_INITIAL_DELAY = 500; // 500ms to reduce the chance to reach the  rate limit of etherscan in case of page reload

export default {
  startGasListening({ commit, state }, caller: string): void {
    commit('pushGasListenerCaller', caller);

    if (state.gasUpdating) {
      return;
    }

    commit('setGasUpdating', true);

    if (state.gasUpdaterHandle !== undefined) {
      return;
    }

    const updateGasFunc = async () => {
      try {
        const resp = await getGasPrices(state.networkInfo?.network);
        commit('setGasPrices', resp);
      } catch (err) {
        commit('setRefreshEror', err);
        console.log(`Can't get gas prices, err: ${err}`);
        Sentry.captureException(err);
      } finally {
        if (state.gasUpdating) {
          commit(
            'setGasUpdaterHandle',
            window.setTimeout(updateGasFunc, GAS_UPDATE_INTERVAL)
          );
        } else {
          commit('clearGasUpdaterHandle');
        }
      }
    };

    commit(
      'setGasUpdaterHandle',
      window.setTimeout(updateGasFunc, GAS_INITIAL_DELAY)
    );
  },
  stopGasListening({ commit, state }, caller): void {
    commit('popGasListenerCaller', caller);

    if (state.gasUpdaterCallers.length === 0 && state.gasUpdating) {
      commit('setGasUpdating', false);
    }
  }
} as ActionTree<AccountStoreState, RootStoreState>;
