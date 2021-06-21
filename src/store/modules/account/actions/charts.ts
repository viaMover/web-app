import { AccountStoreState } from '@/store/modules/account/types';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';

export type EmitChartRequestPayload = {
  assetCode: string;
  nativeCurrency: string;
  ChartTypes: string;
};

export default {
  emitChartRequest({ commit, state }, payload: EmitChartRequestPayload): void {
    try {
      state.explorer?.GetChartData(
        payload.assetCode,
        payload.nativeCurrency,
        payload.ChartTypes
      );
    } catch (err) {
      console.error(`Can't get chart data: ${err}`);
    }
  }
} as ActionTree<AccountStoreState, RootStoreState>;
