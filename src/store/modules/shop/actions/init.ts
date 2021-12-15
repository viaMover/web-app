import { ActionTree } from 'vuex';

import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';

import { getCeoOfMoneyTokenData } from '@/services/chain';
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

    const ceoOfMoneyDataPromise = getCeoOfMoneyTokenData(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3
    );

    try {
      const [ceoOfMoneyDataRes] = await Promise.allSettled([
        ceoOfMoneyDataPromise
      ]);

      if (ceoOfMoneyDataRes.status === 'fulfilled') {
        console.log('SET refreshAssetsInfoList');
        const id = '$CEO1';
        console.log(
          rootState.i18n?.t(`nibbleShop.txtAssets.${id}.description`)
        );
        commit('setAsset', {
          assetId: id,
          asset: ceoOfMoneyDataRes.value
        } as SetAssetData);
      } else {
        logger.error(
          "Can't get data about CEO OF MONEY",
          ceoOfMoneyDataRes.reason
        );
        Sentry.captureException("Can't get data about CEO OF MONEY");
      }
    } catch (err) {
      console.error("can't load shop's data", err);
      Sentry.captureException(err);
    }

    commit('setIsLoading', false);
  }
} as ActionTree<ShopStoreState, RootStoreState>;
