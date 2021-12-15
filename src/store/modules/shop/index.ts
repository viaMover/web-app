import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actionsClaim from './actions/claim';
import actionsInit from './actions/init';
import getters from './getters';
import mutations from './mutations';
import { ShopStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    localAssets: [
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
          background: '#f0f6f8'
        }
      }
    ],
    assets: [],
    isLoading: false
  },
  actions: {
    ...actionsInit,
    ...actionsClaim
  },
  getters,
  mutations
} as Module<ShopStoreState, RootStoreState>;
