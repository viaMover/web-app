import { MutationTree } from 'vuex';

import { Asset, ShopStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setLoadingPromise(state, loadingPromise: Promise<Array<Asset>>): void {
    state.loadingPromise = loadingPromise;
  },
  setAssets(state, assets: Array<Asset>): void {
    state.assets = assets;
  }
} as MutationTree<ShopStoreState>;
