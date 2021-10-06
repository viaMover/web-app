import { ActionTree } from 'vuex';

import { RootStoreState } from '@/store/types';

import { Asset, ShopStoreState } from './types';

export default {
  async loadAssetsInfoList({
    rootState,
    state,
    commit
  }): Promise<Array<Asset>> {
    if (state.isLoading && state.loadingPromise !== null) {
      return state.loadingPromise;
    }

    if (!state.isLoading && state.assets.length > 0) {
      return Promise.resolve(state.assets);
    }

    commit('setIsLoading', true);

    // TODO get remote info about shop assets
    // commit("setLoadingPromise", <loadingPromise>);
    const remoteEntries = [
      {
        id: '$CEO1',
        price: 49.99,
        totalTrades: 1345,
        initialQuantity: 30,
        redeemedQuantity: 4,
        remainingQuantity: 26,
        availableQuantity: 7
      },
      {
        id: '$SJ1',
        price: 49.99,
        totalTrades: 255,
        initialQuantity: 30,
        redeemedQuantity: 27,
        remainingQuantity: 2,
        availableQuantity: 1
      },
      {
        id: '$IC1',
        price: 49.99,
        totalTrades: 255,
        initialQuantity: 30,
        redeemedQuantity: 27,
        remainingQuantity: 2,
        availableQuantity: 1
      },
      {
        id: '$PWR01',
        price: 49.99,
        totalTrades: 255,
        initialQuantity: 30,
        redeemedQuantity: 27,
        remainingQuantity: 2,
        availableQuantity: 1
      }
    ];

    const localEntries: Array<Asset> = [
      {
        id: '$CEO1',
        address:
          '0x806cb7767eb835e5fe0e4de354cc946e21418997d01b90d9f98b0e4da195ce92',
        price: '$49.99',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        title: 'The Cap',
        shortName: 'cap',
        preview: {
          videoSrc: require('@/assets/videos/CeoOfMoney.webm'),
          background: '#dbe2e6'
        },
        page: {
          videoSrc: require('@/assets/videos/CeoOfMoney.webm'),
          description: '',
          background: '#dbe2e6'
        }
      },
      {
        id: '$SJ1',
        address:
          '0x806cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        price: '$49.99',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        title: 'Face mask',
        shortName: 'mask',
        preview: {
          videoSrc: require('@/assets/videos/FaceMask.webm'),
          background: '#dde3e7'
        },
        page: {
          videoSrc: require('@/assets/videos/FaceMask.webm'),
          description: '',
          background: '#dde3e7'
        }
      },
      {
        id: '$IC1',
        address:
          '0x806cb7767eb835f5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        price: '$49.99',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        title: 'Classic T-Shirt',
        shortName: 'classic T-Shirt',
        preview: {
          videoSrc: require('@/assets/videos/ClassicTShirt.webm'),
          background: '#f0f6f8'
        },
        page: {
          videoSrc: require('@/assets/videos/ClassicTShirt.webm'),
          description: '',
          background: '#f0f6f8'
        }
      },
      {
        id: '$PWR01',
        address:
          '0x806cb7767fb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        price: '$49.99',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        title: 'Power T-Shirt',
        shortName: 'power T-Shirt',
        preview: {
          videoSrc: require('@/assets/videos/PowerTShirt.webm'),
          background: '#f0f6f8'
        },
        page: {
          videoSrc: require('@/assets/videos/PowerTShirt.webm'),
          description: '',
          background: '#f0f6f8'
        }
      }
    ];

    remoteEntries.forEach((remoteEntry) => {
      const localEntryIdx = localEntries.findIndex(
        (localEntry) => localEntry.id === remoteEntry.id
      );
      if (localEntryIdx < 0) {
        return;
      }

      localEntries[localEntryIdx] = {
        ...localEntries[localEntryIdx],
        totalTrades: remoteEntry.totalTrades,
        initialQuantity: remoteEntry.initialQuantity,
        redeemedQuantity: remoteEntry.redeemedQuantity,
        remainingQuantity: remoteEntry.remainingQuantity,
        availableQuantity: remoteEntry.availableQuantity,
        page: {
          ...localEntries[localEntryIdx].page,
          description: rootState.i18n?.te(
            `nibbleShop.txtAssets.${localEntries[localEntryIdx].id}.description`
          )
            ? (rootState.i18n?.t(
                `nibbleShop.txtAssets.${localEntries[localEntryIdx].id}.description`
              ) as string)
            : localEntries[localEntryIdx].page.description
        }
      };
    });

    commit('setLoadingPromise', Promise.resolve(localEntries));
    commit('setAssets', localEntries);
    commit('setLoadingPromise', null);
    commit('setIsLoading', false);
    return localEntries;
  }
} as ActionTree<ShopStoreState, RootStoreState>;
