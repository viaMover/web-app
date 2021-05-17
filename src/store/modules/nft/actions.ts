import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { NFTAggregatedInfo, NFTStoreState } from './types';

export default {
  async loadNFTInfoList({
    rootState,
    state,
    commit
  }): Promise<Array<NFTAggregatedInfo>> {
    if (state.isLoading && state.loadingPromise !== null) {
      return state.loadingPromise;
    }

    if (!state.isLoading && state.NFTs.length > 0) {
      return Promise.resolve(state.NFTs);
    }

    commit('setIsLoading', true);

    // TODO get remote info about NFT
    // commit("setLoadingPromise", <loadingPromise>);
    const remoteEntries = [
      {
        id: '$SAS',
        totalNumber: 1345,
        totalClaimed: 24
      },
      {
        id: '$NFTMOVER1',
        totalNumber: 24,
        totalClaimed: 7
      }
    ];

    const localEntries: Array<NFTAggregatedInfo> = [
      {
        nft: {
          id: '$SAS',
          name: 'Sweet & Sour',
          description:
            (rootState.i18n?.t('txtNFTs.sweetAndSour.description') as string) ??
            '',
          imageSrc:
            'https://viamover.com/assets/images/social-holyheld-is-moving.png'
        },
        totalNumber: 0,
        totalClaimed: 0
      },
      {
        nft: {
          id: '$NFTMOVER1',
          name: 'UnexpectedMove',
          description:
            (rootState.i18n?.t(
              'txtNFTs.unexpectedMove.description'
            ) as string) ?? '',
          imageSrc:
            'https://viamover.com/assets/images/social-holyheld-is-moving.png'
        },
        totalNumber: 0,
        totalClaimed: 0
      }
    ];

    remoteEntries.forEach((remoteEntry) => {
      const localEntryIdx = localEntries.findIndex(
        (localEntry) => localEntry.nft.id === remoteEntry.id
      );
      if (localEntryIdx < 0) {
        return;
      }

      localEntries[localEntryIdx] = {
        ...localEntries[localEntryIdx],
        totalNumber: remoteEntry.totalNumber,
        totalClaimed: remoteEntry.totalClaimed
      };
    });

    commit('setLoadingPromise', Promise.resolve(localEntries));
    commit('setNFTs', localEntries);
    commit('setLoadingPromise', null);
    commit('setIsLoading', false);
    return localEntries;
  }
} as ActionTree<NFTStoreState, RootStoreState>;
