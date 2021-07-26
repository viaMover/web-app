import { GetterTree } from 'vuex';
import { RootStoreState } from '@/store/types';

import { Asset, RadarStoreState } from './types';

export default {
  personalList(store): Array<Asset> {
    return store.personalList;
  },
  curatedList(store): Array<Asset> {
    return store.curatedList;
  }
} as GetterTree<RadarStoreState, RootStoreState>;
