import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { AccountStoreState } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';

export default {
  namespaced: true,
  strict: true,
  state: {
    addresses: [
      '0x806cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92'
    ],
    currentAddress:
      '0x806cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92',
    transactions: [
      {
        timeStamp: 1608708729,
        hash: '0x03b2f4d4ab5e45b088492860bd9a2818b849853a2ca516fbe383cab7183efc4d'
      },
      {
        timeStamp: 1608707729,
        hash: '0x806cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92'
      },
      {
        timeStamp: 1609708729,
        hash: '0x03b3f4d4ab5e45b088492860bd9a2818b849853a2ca516fbe383cab7183efc4d'
      },
      {
        timeStamp: 1508738729,
        hash: '0x806eb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92'
      },
      {
        timeStamp: 1621152760,
        hash: '0x13b2f4d4ab5e45b088492860bd9a2818b849853a2ca516fbe383cab7183efc4d'
      },
      {
        timeStamp: 1621260360,
        hash: '0x836cb7767eb835e5fe0e4de354cb946e21418997d01b90d9f98b0e4da195ce92'
      },
      {
        timeStamp: 1621260760,
        hash: '0x04b2f4d4ab5e45b088492860bd9a2818b849853a2ca516fbe383cab7183efc4d'
      }
    ]
  },
  actions,
  getters,
  mutations
} as Module<AccountStoreState, RootStoreState>;
