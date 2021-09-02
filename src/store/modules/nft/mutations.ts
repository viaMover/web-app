import { greaterThan } from '@/utils/bigmath';
import { UnexpectedMoveData, SweetAndSourData } from '@/services/chain';
import { MutationTree } from 'vuex';
import { NftAsset, NFTStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setNFTs(state, data: Array<NftAsset>): void {
    state.nfts = data;
  },
  setUnexpectedMoveData(state, data: UnexpectedMoveData): void {
    state.UnexpectedMoveTotalAmount = data.totalAmount;
    state.UnexpectedMoveTotalClaimed = data.totalClaimed;
    state.UnexpectedMoveTotalExchanged = data.totalExchanged;
    state.UnexpectedMoveBalance = data.balance;
  },
  setSweetAndSourData(state, data: SweetAndSourData): void {
    state.SweetAndSourTotalAmount = data.totalAmount;
    state.SweetAndSourTotalClaimed = data.totalClaimed;
  }
} as MutationTree<NFTStoreState>;
