import { GettersFuncs } from '@/store/types';
import { greaterThan } from '@/utils/bigmath';

import { Asset, ShopStoreState } from './types';

type Getters = {
  isLoading: boolean;
  accountAssets: Array<Asset>;
};

const getters: GettersFuncs<Getters, ShopStoreState> = {
  isLoading(state): boolean {
    return state.isLoading;
  },
  accountAssets(state): Array<Asset> {
    return state.assets.filter((asset) => greaterThan(asset.balance, 0));
  }
};

export type GetterType = typeof getters;
export default getters;
