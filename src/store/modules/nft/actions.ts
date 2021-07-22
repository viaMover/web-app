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
            (rootState.i18n?.t(
              'NFTs.txtNFTs.sweetAndSour.description'
            ) as string) ?? '',
          imageScaleH: '112%',
          imageScaleV: '46%',
          previewImageSrc: require('@/assets/images/drops-img1.png'),
          imageSrc: require('@/assets/images/sweet-and-sour-bg.png'),
          page: {
            videoSrc: require('@/assets/videos/SweetAndSour.webm'),
            iconSrc: require('@/assets/images/sweet-and-sour-img.png'),
            description:
              (rootState.i18n?.t(
                'NFTs.txtNFTs.sweetAndSour.pageDescription'
              ) as string) ?? '',
            imageBackground: '#0a0a0a',
            imageWidth: '355px'
          },
          background: '#0a0a0a',
          titleColor: '#fff',
          textColor: 'rgba(255, 255, 255, 0.6)',
          btnBackgroundColor: '#fff',
          btnTextColor: '#000',
          imageSize: '69%'
        },
        totalNumber: 0,
        totalClaimed: 0
      },
      {
        nft: {
          id: '$NFTMOVER1',
          name: 'Unexpected Move',
          description:
            (rootState.i18n?.t(
              'NFTs.txtNFTs.unexpectedMove.description'
            ) as string) ?? '',
          imageScaleH: '',
          imageScaleV: 'bottom',
          previewImageSrc: require('@/assets/images/drops-img2.png'),
          imageSrc: require('@/assets/images/unexpected-move-bg.png'),
          page: {
            videoSrc: require('@/assets/videos/UnexpectedMove.webm'),
            iconSrc: require('@/assets/images/unexpected-move-img.png'),
            description:
              (rootState.i18n?.t(
                'NFTs.txtNFTs.unexpectedMove.pageDescription'
              ) as string) ?? '',
            imageBackground: '#01011d',
            imageWidth: '378px'
          },
          background: '#e4e4e4',
          titleColor: '#000',
          textColor: 'rgba(60, 60, 67, 0.6)',
          imageSize: '100%',
          btnTextColor: '#fff',
          btnBackgroundColor: '#000'
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
