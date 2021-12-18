import { ActionTree } from 'vuex';

import * as Sentry from '@sentry/vue';

import { redeemNibbleToken } from '@/services/chain/shop/token';
import { redeemNibbleShopNFT } from '@/services/mover/nibble-shop';
import {
  NibbleShopApiError,
  NibbleShopRedeemPayload
} from '@/services/mover/nibble-shop/types';
import { RootStoreState } from '@/store/types';

import { Step } from '@/components/forms/form-loader/types';

import { checkAccountStateIsReady } from '../../account/utils/state';
import { RedeemParams } from '../types';
import { ShopStoreState } from '../types';

export type RedeemPayload = {
  changeStep: (step: Step) => void;
  tokenId: string;
  signature: string;
};

export default {
  async requestToNibbleShopRedeemServer(
    { rootState },
    params: RedeemParams
  ): Promise<string> {
    try {
      if (rootState.account?.currentAddress === undefined) {
        throw new Error('failed to get current address');
      }

      if (rootState.account?.provider?.web3 === undefined) {
        throw new Error('failed to get web3 provider');
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
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    const asset = state.assets.find((asset) => asset.id === payload.tokenId);

    if (asset === undefined) {
      throw new Error(
        `Trying to redeem non existed nibble token: ${payload.tokenId}`
      );
    }

    await redeemNibbleToken(
      asset.address,
      asset.intId,
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  }
} as ActionTree<ShopStoreState, RootStoreState>;
