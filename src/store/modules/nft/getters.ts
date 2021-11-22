import { GetterTree } from 'vuex';

import { RootStoreState } from '@/store/types';
import { greaterThan } from '@/utils/bigmath';

import { NFTStoreState } from './types';

export default {
  canExchangeUnexpectedMove(state): boolean {
    return greaterThan(state.UnexpectedMoveBalance, '0');
  },
  hasOlympus(state): boolean {
    return greaterThan(state.OlympusBalance, '0');
  }
} as GetterTree<NFTStoreState, RootStoreState>;
