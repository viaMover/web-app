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
      {
        address:
          '0x806cb7767eb835e5fe0e4de354cc946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'Cap',
        price: '$49.99'
      },
      {
        address:
          '0x806cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'Cap',
        price: '$49.99'
      },
      {
        address:
          '0x806cb7767eb835f5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'Cap',
        price: '$49.99'
      },
      {
        address:
          '0x806cb7767fb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
        imageSrc:
          'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cadet_Cap.jpg',
        title: 'Cap',
        price: '$49.99'
      }
    ]
  },
  actions,
  getters,
  mutations
} as Module<ShopStoreState, RootStoreState>;
