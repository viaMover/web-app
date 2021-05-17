import { GetterTree } from 'vuex';
import { RootStoreState } from '@/store/types';

import { NFT, NFTStoreState } from './types';

export default {
  plainNFTs(store): Array<NFT> {
    return store.NFTs.map((nftInfo) => nftInfo.nft);
  }
} as GetterTree<NFTStoreState, RootStoreState>;
