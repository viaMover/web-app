import Vue from 'vue';
import { MutationTree } from 'vuex';

import { Asset, SetAssetData, ShopStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setAsset(state, data: SetAssetData): void {
    const localEntryIdx = state.localAssets.findIndex(
      (localEntry) => localEntry.id === data.assetId
    );
    if (localEntryIdx < 0) {
      return;
    }

    const assetIdx = state.assets.findIndex(
      (asset) => asset.id === data.assetId
    );
    if (assetIdx < 0) {
      state.assets.push({
        ...state.localAssets[localEntryIdx],
        initialQuantity: data.asset.totalSupplyCap
      });
    } else {
      Vue.set(state.assets, assetIdx, {
        ...state.assets[assetIdx],
        initialQuantity: data.asset.totalSupplyCap
      });
    }
  }
} as MutationTree<ShopStoreState>;
