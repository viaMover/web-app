import { GettersFuncs } from '@/store/types';

import { Asset, RadarStoreState } from './types';

enum Getters {
  personalList,
  curatedList
}

const getters: GettersFuncs<typeof Getters, RadarStoreState> = {
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
};

export type GetterType = typeof getters;
export default getters;
