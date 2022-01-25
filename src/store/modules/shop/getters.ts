import { GettersFuncs } from '@/store/types';

import { ShopStoreState } from './types';

enum Getters {}

const getters: GettersFuncs<typeof Getters, ShopStoreState> = {};

export type GetterType = typeof getters;
export default getters;
