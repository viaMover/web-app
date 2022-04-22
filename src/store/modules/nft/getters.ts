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
    const res: Array<BaseNftAsset> = [];
    const network = rootState.account?.networkInfo?.network;
    if (network === undefined) {
      return res;
    }
    if (isFeatureEnabled('isNftDropsEnabled', network)) {
      if (state.dice.networks.includes(network)) {
        res.push(state.dice);
      }
      if (state.movingWithOlympus.networks.includes(network)) {
        res.push(state.movingWithOlympus);
      }
      if (state.sweetAndSour.networks.includes(network)) {
        res.push(state.sweetAndSour);
      }
      if (state.unexpectedMove.networks.includes(network)) {
        res.push(state.unexpectedMove);
      }
      if (state.vaults.networks.includes(network)) {
        res.push(state.vaults);
      }
      if (state.baseledgerStakingOG.networks.includes(network)) {
        res.push(state.baseledgerStakingOG);
      }
      if (state.orderOfLiberty.networks.includes(network)) {
        res.push(state.orderOfLiberty);
      }

      if (state.swapPassport !== undefined) {
        res.push(state.swapPassport);
      }
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
