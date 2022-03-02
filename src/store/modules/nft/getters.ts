import { isFeatureEnabled } from '@/settings';
import { GettersFuncs } from '@/store/types';
import { greaterThan } from '@/utils/bigmath';

import { BaseNftAsset, NFTStoreState } from './types';

type Getters = {
  canExchangeUnexpectedMove: boolean;
  hasOlympus: boolean;
  nfts: Array<BaseNftAsset>;
  accountNfts: Array<BaseNftAsset>;
};

const getters: GettersFuncs<Getters, NFTStoreState> = {
  canExchangeUnexpectedMove(state): boolean {
    return greaterThan(state.unexpectedMove.balance, '0');
  },
  hasOlympus(state): boolean {
    return greaterThan(state.movingWithOlympus.balance, '0');
  },
  nfts(state, getters, rootState): Array<BaseNftAsset> {
    let res: Array<BaseNftAsset> = [];
    if (
      isFeatureEnabled(
        'isNftDropsEnabled',
        rootState.account?.networkInfo?.network
      )
    ) {
      res = [
        state.dice,
        state.movingWithOlympus,
        state.sweetAndSour,
        state.unexpectedMove,
        state.vaults
      ];

      if (state.swapPassport !== undefined) {
        res.push(state.swapPassport);
      }
    }

    if (
      isFeatureEnabled(
        'isOrderOfLibertyNFTEnabled',
        rootState.account?.networkInfo?.network
      )
    ) {
      res.push(state.orderOfLiberty);
    }

    return res;
  },
  accountNfts(state, getters): Array<BaseNftAsset> {
    return getters.nfts.filter((asset: BaseNftAsset) =>
      greaterThan(asset.balance, 0)
    );
  }
};

export type GetterType = typeof getters;
export default getters;
