import { SweetAndSourData } from '@/services/chain/nft/sweet-and-sour/index';
import { UnexpectedMoveData } from '@/services/chain/nft/unexpected-move/index';
import { MutationTree } from 'vuex';
import { NFTStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setUnexpectedMoveData(state, data: UnexpectedMoveData): void {
    state.UnexpectedMoveTotalAmount = data.totalAmount;
    state.UnexpectedMoveTotalClaimed = data.totalClaimed;
    state.UnexpectedMoveTotalExchanged = data.totalExchanged;
  },
  setSweetAndSourData(state, data: SweetAndSourData): void {
    state.SweetAndSourTotalAmount = data.totalAmount;
    state.SweetAndSourTotalClaimed = data.totalClaimed;
  }
} as MutationTree<NFTStoreState>;
