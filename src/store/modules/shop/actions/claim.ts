import { ActionTree } from 'vuex';

import { claimNibbleToken } from '@/services/chain';
import { ShopStoreState } from '@/store/modules/shop/types';
import { RootStoreState } from '@/store/types';

import { Step } from '@/components/forms/form-loader';

export type ClaimPayload = {
  changeStep: (step: Step) => void;
  tokenId: string;
};

export default {
  async claimNibbleNFT(
    { rootState, state },
    payload: ClaimPayload
  ): Promise<void> {
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
} as ActionTree<ShopStoreState, RootStoreState>;
