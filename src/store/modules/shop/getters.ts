import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { greaterThan } from '@/utils/bigmath';

import { Asset, ShopStoreState } from './types';

export default {
  accountAssets(state): Array<Asset> {
    return state.assets.filter((asset) => greaterThan(asset.balance, 0));
  }
} as GetterTree<ShopStoreState, RootStoreState>;
