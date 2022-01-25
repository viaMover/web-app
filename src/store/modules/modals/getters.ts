import { ModalsStoreState } from '@/store/modules/modals/types';
import { GettersFuncs } from '@/store/types';

enum Getters {}

const getters: GettersFuncs<typeof Getters, ModalsStoreState> = {};

export type GetterType = typeof getters;
export default getters;
