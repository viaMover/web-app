import { GettersFuncs } from '@/store/types';

import { ShopStoreState } from './types';

type Getters = {
  isLoading: boolean;
};

const getters: GettersFuncs<Getters, ShopStoreState> = {
  isLoading(state): boolean {
    return state.isLoading;
  }
};

export type GetterType = typeof getters;
export default getters;
