import { GetterTree } from 'vuex';

import { greaterThan } from '@/utils/bigmath';
import { RootStoreState } from '@/store/types';
import { NFTStoreState } from './types';

export default {
  canExchangeUnexpectedMove(state): boolean {
    return greaterThan(state.UnexpectedMoveBalance, '0');
  }
} as GetterTree<NFTStoreState, RootStoreState>;
