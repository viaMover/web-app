import Vue from 'vue';

import { MutationFuncs } from '@/store/types';

import { SetAssetData, ShopStoreState } from './types';

enum Mutations {
  setIsLoading,
  setAsset
}

const mutations: MutationFuncs<typeof Mutations, ShopStoreState> = {
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
        ...(data.asset.initialQuantity !== undefined && {
          initialQuantity: data.asset.initialQuantity
        }),
        balance: data.asset.balance,
        redeemCount: data.asset.redeemCount,
        totalClaimed: data.asset.totalClaimed,
        intId: data.asset.tokenIntId
      });
    } else {
      Vue.set(state.assets, assetIdx, {
        ...state.assets[assetIdx],
        ...(data.asset.initialQuantity !== undefined && {
          initialQuantity: data.asset.initialQuantity
        }),
        balance: data.asset.balance,
        redeemCount: data.asset.redeemCount,
        totalClaimed: data.asset.totalClaimed,
        intId: data.asset.tokenIntId
      });
    }
  }
};

export type MutationType = typeof mutations;
export default mutations;
