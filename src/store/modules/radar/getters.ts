import { GetterTree } from 'vuex';
import { RootStoreState } from '@/store/types';

import { Asset, RadarStoreState } from './types';

export default {
  personalList(store): Array<Asset> {
    if (store.personalList === undefined) {
      return [];
    }
    return store.personalList;
  },
  curatedList(store): Array<Asset> {
    if (store.curatedList === undefined) {
      return [];
    }
    return store.curatedList;
  }
} as GetterTree<RadarStoreState, RootStoreState>;
