import { MutationTree } from 'vuex';
import { NFTAggregatedInfo, NFTStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setLoadingPromise(
    state,
    loadingPromise: Promise<Array<NFTAggregatedInfo>>
  ): void {
    state.loadingPromise = loadingPromise;
  },
  setNFTs(state, NFTs: Array<NFTAggregatedInfo>): void {
    state.NFTs = NFTs;
  }
} as MutationTree<NFTStoreState>;
