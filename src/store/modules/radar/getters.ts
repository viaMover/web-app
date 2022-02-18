import { GettersFuncs } from '@/store/types';

import { Asset, RadarStoreState } from './types';

type Getters = {
  personalList: Array<Asset>;
  curatedList: Array<Asset>;
};

const getters: GettersFuncs<Getters, RadarStoreState> = {
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
