import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import { EarningsStoreState } from './types';
import { ActiveProviders } from './utils';

type Actions = {
  loadMinimalInfo: Promise<void>;
};

const actions: ActionFuncs<
  Actions,
  EarningsStoreState,
  MutationType,
  GetterType
> = {
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
