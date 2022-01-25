import { GettersFuncs } from '@/store/types';
import { greaterThan } from '@/utils/bigmath';

import { NFTStoreState } from './types';

enum Getters {
  canExchangeUnexpectedMove,
  hasOlympus
}

const getters: GettersFuncs<typeof Getters, NFTStoreState> = {
  canExchangeUnexpectedMove(state): boolean {
    return greaterThan(state.UnexpectedMoveBalance, '0');
  },
  hasOlympus(state): boolean {
    return greaterThan(state.OlympusBalance, '0');
  }
};

export type GetterType = typeof getters;
export default getters;
