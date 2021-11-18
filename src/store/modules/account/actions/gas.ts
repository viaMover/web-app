import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import { getGasPrices } from '@/wallet/gas';

const GAS_UPDATE_INTERVAL = 60000; // 60s
const GAS_INITIAL_DELAY = 500; // 500ms to reduce the chance to reach the  rate limit of etherscan in case of page reload
let isOverrunning = false;

export default {
  startGasListening({ commit, state }, caller: string): void {
    commit('pushCaller', caller);

    if (state.gasUpdating) {
      // the process is already running or some other caller already requested
      // gas listening. There is no need to change things
      return;
    }

    commit('setGasUpdating', true);

    if (isOverrunning) {
      // if the cycle is still in interval
      // then as state.gasUpdating is set
      // new cycles will keep going
      // so there is no need to change things
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
          setTimeout(updateGasFunc, GAS_UPDATE_INTERVAL);
        } else {
          // if there is no need to perform another cycle
          // we stop overrunning and finish here
          isOverrunning = false;
        }
      }
    };

    isOverrunning = true;
    setTimeout(updateGasFunc, GAS_INITIAL_DELAY);
  },
  stopGasListening({ commit, state }, caller): void {
    commit('popCaller', caller);

    if (state.gasUpdaterCallers.length === 0) {
      // if there is no listeners left
      // then we just shut down the process here
      // and let it overrun if needed
      commit('setGasUpdating', false);
    }
  }
} as ActionTree<AccountStoreState, RootStoreState>;
