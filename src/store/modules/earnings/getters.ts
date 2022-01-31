import { GettersFuncs } from '@/store/types';

import { EarningsStoreState } from './types';

type Getters = {
  earningsBalanceNative: string;
};

const getters: GettersFuncs<Getters, EarningsStoreState> = {
  earningsBalanceNative(): string {
    return '0';
  }
};

export type GetterType = typeof getters;
export default getters;
