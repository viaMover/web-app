import { GettersFuncs } from '@/store/types';

import { EarningsStoreState } from './types';

enum Getters {
  earningsBalanceNative
}

const getters: GettersFuncs<typeof Getters, EarningsStoreState> = {
  earningsBalanceNative(): string {
    return '0';
  }
};

export type GetterType = typeof getters;
export default getters;
