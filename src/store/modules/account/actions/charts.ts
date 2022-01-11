import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';

export type EmitChartRequestPayload = {
  assetCode: string;
  nativeCurrency: string;
  ChartTypes: string;
};

export default {
  emitChartRequest({ state }, payload: EmitChartRequestPayload): void {
    try {
      state.explorer?.getChartData(
        payload.assetCode,
        payload.nativeCurrency,
        payload.ChartTypes
      );
    } catch (err) {
      console.error(`Can't get chart data: ${err}`);
      Sentry.captureException(err);
    }
  }
} as ActionTree<AccountStoreState, RootStoreState>;
