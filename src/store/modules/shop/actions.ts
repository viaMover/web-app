import * as Sentry from '@sentry/vue';

import {
  claimNibbleToken,
  getNibbleTokenData,
  redeemNibbleToken
} from '@/services/chain/shop/token';
import { redeemNibbleShopNFT } from '@/services/mover/nibble-shop';
import {
  NibbleShopApiError,
  NibbleShopRedeemPayload
} from '@/services/mover/nibble-shop/types';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import {
  ClaimPayload,
  RedeemParams,
  RedeemPayload,
  SetAssetData,
  ShopStoreState
} from '@/store/modules/shop/types';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';

type Actions = {
  requestToNibbleShopRedeemServer: Promise<string>;
  redeemNibbleNFT: Promise<void>;
  refreshAssetsInfoList: Promise<void>;
  claimNibbleNFT: Promise<void>;
};

const actions: ActionFuncs<Actions, ShopStoreState, MutationType, GetterType> =
  {
    async requestToNibbleShopRedeemServer(
      { rootState },
      params: RedeemParams
    ): Promise<string> {
      try {
        if (!ensureAccountStateIsSafe(rootState.account)) {
          throw new Error('account state is not ready');
        }

        const dataPayload: NibbleShopRedeemPayload = {
          accountAddress: rootState.account.currentAddress,
          address: params.address,
          country: params.country,
          email: params.email,
          name: params.name,
          postalCode: params.postalCode,
          tokenId: params.tokenIntId
        };

        const personalDataSignature =
          await rootState.account.provider.web3.eth.personal.sign(
            JSON.stringify(dataPayload),
            rootState.account.currentAddress,
            ''
          );

        const res = await redeemNibbleShopNFT(
          dataPayload,
          params.tokenUrl,
          personalDataSignature
        );
        if (res.isError) {
          if (res.shortError !== undefined) {
            Sentry.captureMessage(
              `An error occurred during redeem nibble shop token: ${res.shortError} (${res.error})`
            );

            // TODO: add proper errors if needed
            // if (res.shortError === 'ALREADY_REGISTERED') {
            //   throw new NibbleShopApiError('alreadyRegistered');
            // }
          }

          throw new NibbleShopApiError(res.error, res.shortError, res.payload);
        }
        return personalDataSignature;
      } catch (error) {
        console.error('failed to perform API request to redeem', error);
        Sentry.captureException(error);
        throw error;
      }
    },
    async redeemNibbleNFT(
      { rootState, state },
      payload: RedeemPayload
    ): Promise<void> {
      if (!ensureAccountStateIsSafe(rootState.account)) {
        throw new Error('account state is not ready');
      }

      const asset = state.assets.find((asset) => asset.id === payload.tokenId);

      if (asset === undefined) {
        throw new Error(
          `Trying to redeem non existed nibble token: ${payload.tokenId}`
        );
      }

      await redeemNibbleToken(
        asset.address,
        asset.intId,
        rootState.account.currentAddress,
        payload.signature,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3,
        payload.changeStep
      );
    },
    async refreshAssetsInfoList({ rootState, state, commit }): Promise<void> {
      if (!ensureAccountStateIsSafe(rootState.account)) {
        throw new Error('account state is not ready');
      }

      if (state.isLoading) {
        return Promise.resolve();
      }

      commit('setIsLoading', true);

      try {
        const promisesResults = await Promise.allSettled(
          state.assets.map(async (asset) => {
            // Object is possibly 'undefined' errors here are
            // suspended with eslint directives because of
            // TypeScript's lack of callback closure context propagation
            return getNibbleTokenData(
              asset.id,
              asset.address,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              rootState.account!.currentAddress!,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              rootState.account!.networkInfo!.network,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            addSentryBreadcrumb({
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
    },
    async claimNibbleNFT(
      { rootState, state },
      payload: ClaimPayload
    ): Promise<void> {
      if (!ensureAccountStateIsSafe(rootState.account)) {
        throw new Error('account state is not ready');
      }

      const asset = state.assets.find((asset) => asset.id === payload.tokenId);

      if (asset === undefined) {
        throw new Error(
          `Trying to claim non existed nibble token: ${payload.tokenId}`
        );
      }

      await claimNibbleToken(
        asset.address,
        rootState.account.currentAddress,
        asset.feeAmount,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3,
        payload.changeStep
      );
    }
  };

export type ActionType = typeof actions;
export default actions;
