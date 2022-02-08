import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { greaterThan } from '@/utils/bigmath';

import { BaseNftAsset, NFTStoreState } from './types';

export default {
  canExchangeUnexpectedMove(state): boolean {
    return greaterThan(state.unexpectedMove.balance, '0');
  },
  hasOlympus(state): boolean {
    return greaterThan(state.movingWithOlympus.balance, '0');
  },
  nfts(state): Array<BaseNftAsset> {
    const res: Array<BaseNftAsset> = [
      state.movingWithOlympus,
      state.unexpectedMove,
      state.sweetAndSour,
      state.dice,
      state.vaults
    ];

    if (state.swapPassport !== undefined) {
      res.push(state.swapPassport);
    }

    return res;
  },
  accountNfts(state, getters): Array<BaseNftAsset> {
    return getters.nfts.filter((asset: BaseNftAsset) =>
      greaterThan(asset.balance, 0)
    );
  }
} as GetterTree<NFTStoreState, RootStoreState>;
