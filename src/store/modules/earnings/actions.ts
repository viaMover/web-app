import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { EarningsStoreState } from './types';
import { ActiveProviders } from './utils';

export default {
  async loadMinimalInfo({ dispatch }, text): Promise<void> {
    const providersLoadInfoPromises = new Array<Promise<void>>();

    for (const provider of ActiveProviders) {
      providersLoadInfoPromises.push(
        dispatch(`${provider}/loadMinimalInfo`),
        text
      );
    }

    await Promise.allSettled(providersLoadInfoPromises);
  }
} as ActionTree<EarningsStoreState, RootStoreState>;
