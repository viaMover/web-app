import { ActionTree } from 'vuex';

import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';

import { getNibbleTokenData } from '@/services/chain';
import { RootStoreState } from '@/store/types';

import { SetAssetData, ShopStoreState } from './../types';

export default {
  async refreshAssetsInfoList({ rootState, state, commit }): Promise<void> {
    if (rootState.account === undefined) {
      throw new Error('Account state is not loaded, please, try again');
    }

    if (rootState.account.currentAddress === undefined) {
      throw new Error('failed to get current address');
    }

    if (rootState.account.networkInfo?.network === undefined) {
      throw new Error('failed to get current network');
    }

    if (rootState.account.provider?.web3 === undefined) {
      throw new Error('failed to get web3 provider');
    }

    if (state.isLoading) {
      return Promise.resolve();
    }

    commit('setIsLoading', true);

    try {
      const promisesResults = await Promise.allSettled(
        state.localAssets
          .filter((lt) => lt.active)
          .map(async (localToken) => {
            return getNibbleTokenData(
              localToken.id,
              localToken.address,
              rootState.account!.currentAddress!,
              rootState.account!.networkInfo!.network,
              rootState.account!.provider!.web3
            );
          })
      );

      promisesResults.forEach((res) => {
        if (res.status === 'fulfilled') {
          commit('setAsset', {
            assetId: res.value.tokenId,
            asset: res.value
          } as SetAssetData);
        } else {
          Sentry.addBreadcrumb({
            type: 'error',
            category: 'nibble-shop.init.refreshAssetsInfoList',
            message: "Can't get nibble token data",
            data: {
              error: res.reason
            }
          });
        }
      });
    } catch (err) {
      console.error("can't load shop's data", err);
      Sentry.captureException(err);
    }

    commit('setIsLoading', false);
  }
} as ActionTree<ShopStoreState, RootStoreState>;
