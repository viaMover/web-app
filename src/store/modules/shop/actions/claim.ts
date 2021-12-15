import { ActionTree } from 'vuex';

import { claimCeoOfMoney } from '@/services/chain';
import { ShopStoreState } from '@/store/modules/shop/types';
import { RootStoreState } from '@/store/types';

import { Step } from '@/components/forms/form-loader';

import { checkAccountStateIsReady } from '../../account/utils/state';

export type ClaimPayload = {
  changeStep: (step: Step) => void;
};
export default {
  async claimCeoOfMoney({ rootState }, payload: ClaimPayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimCeoOfMoney(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  }
} as ActionTree<ShopStoreState, RootStoreState>;
