import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { ShopStoreState } from './types';
import { RootStoreState } from '@/store/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    assets: [
      // TODO to be replaced with store initial mutation data
      {
        id: '$CEO1',
        address:
          '0x806cb7767eb835e5fe0e4de354cc946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'CEO of Money',
        price: '$49.99',
        edition: 'Genesis Edition',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        description:
          'Nothing really to add here. This cap is hand-made for all the CEOs of all the monies. ' +
          'This is a genesis limited addition with only 30 ever caps to be made. ' +
          'This item will not be restocked. One size fits all CEOs.'
      },
      {
        id: '$SJ1',
        address:
          '0x806cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'Street Jungle',
        price: '$49.99',
        edition: 'Genesis Edition',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        description: ''
      },
      {
        id: '$IC1',
        address:
          '0x806cb7767eb835f5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'Instant Classic',
        price: '$49.99',
        edition: 'Genesis Edition',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        description: ''
      },
      {
        id: '$PWR01',
        address:
          '0x806cb7767fb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'Power T-Shirt',
        price: '$49.99',
        edition: 'Genesis Edition',
        totalTrades: 0,
        initialQuantity: 0,
        redeemedQuantity: 0,
        remainingQuantity: 0,
        availableQuantity: 0,
        description: ''
      }
    ]
  },
  actions,
  getters,
  mutations
} as Module<ShopStoreState, RootStoreState>;
