import { MutationFuncs } from '@/store/types';

import { EarningsStoreState } from './types';

type Mutations = {
  //
};

const mutations: MutationFuncs<Mutations, EarningsStoreState> = {};

export type MutationType = typeof mutations;
export default mutations;
