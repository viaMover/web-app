import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import { EarningsStoreState } from './types';
import { ActiveProviders } from './utils';

enum Actions {
  loadMinimalInfo
}

const actions: ActionFuncs<typeof Actions, EarningsStoreState, MutationType> = {
  async loadMinimalInfo({ dispatch }): Promise<void> {
    const providersLoadInfoPromises = new Array<Promise<void>>();

    for (const provider of ActiveProviders) {
      providersLoadInfoPromises.push(dispatch(`${provider}/loadMinimalInfo`));
    }

    await Promise.allSettled(providersLoadInfoPromises);
  }
};

export type ActionType = typeof actions;
export default actions;
