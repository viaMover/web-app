import { ActionTree } from 'vuex';

import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';

import { getNibbleTokenData } from '@/services/chain';
import { RootStoreState } from '@/store/types';

import { checkAccountStateIsReady } from './../../account/utils/state';
import { SetAssetData, ShopStoreState } from './../types';

export default {
  async refreshAssetsInfoList({ rootState, state, commit }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    console.log('refreshAssetsInfoList');

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
              rootState!.account!.currentAddress!,
              rootState!.account!.networkInfo!.network,
              rootState!.account!.provider!.web3
            );
          })
      );

      promisesResults.forEach((res) => {
        if (res.status === 'fulfilled') {
          console.log(`Set asset: ${res.value.tokenId}`);
          console.log(
            rootState.i18n?.t(
              `nibbleShop.txtAssets.${res.value.tokenId}.description`
            )
          );
          commit('setAsset', {
            assetId: res.value.tokenId,
            asset: res.value
          } as SetAssetData);
        } else {
          logger.error("Can't get nibbler token data", res.reason);
          Sentry.captureException("Can't get nibble token data");
        }
      });
    } catch (err) {
      console.error("can't load shop's data", err);
      Sentry.captureException(err);
    }

    commit('setIsLoading', false);
  }
} as ActionTree<ShopStoreState, RootStoreState>;
