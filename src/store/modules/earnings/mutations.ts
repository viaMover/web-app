import { MutationFuncs } from '@/store/types';

import { EarningsStoreState } from './types';

enum Mutations {}

const mutations: MutationFuncs<typeof Mutations, EarningsStoreState> = {};

export type MutationType = typeof mutations;
export default mutations;
