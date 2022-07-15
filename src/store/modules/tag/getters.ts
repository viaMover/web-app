import { GettersFuncs } from '@/store/types';

import { TagStoreState } from './types';

type Getters = {
  //
};

const getters: GettersFuncs<Getters, TagStoreState> = {};

export type GetterType = typeof getters;
export default getters;
