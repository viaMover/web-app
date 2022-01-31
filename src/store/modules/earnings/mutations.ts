import { MutationFuncs } from '@/store/types';

import { EarningsStoreState } from './types';

type Mutations = {
  doNothing: void;
};

const mutations: MutationFuncs<Mutations, EarningsStoreState> = {
  doNothing(): void {
    //;
  }
};

export type MutationType = typeof mutations;
export default mutations;
