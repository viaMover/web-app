import Vue from 'vue';

import { MutationFuncs } from '@/store/types';

import { SetAssetData, ShopStoreState } from './types';

type Mutations = {
  setIsLoading: void;
  setAsset: void;
};

const mutations: MutationFuncs<Mutations, ShopStoreState> = {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setAsset(state, data: SetAssetData): void {
    const assetIdx = state.assets.findIndex(
      (asset) => asset.id === data.assetId
    );

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
};

export type MutationType = typeof mutations;
export default mutations;
