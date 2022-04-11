import {
  MoverAPIStakingUbtService,
  StakingUbtInfo
} from '@/services/v2/api/mover/staking-ubt';
import { StakingUbtOnChainService } from '@/services/v2/on-chain/mover/staking-ubt';
import { wrapCacheItem } from '@/store/modules/utils';
import { MutationFuncs } from '@/store/types';

import { INFO_TIME_EXPIRE, RECEIPT_TIME_EXPIRE } from './actions';
import { SetStakingUbtReceiptPayload, StakingUbtStoreState } from './types';

type Mutations = {
  setInfo: void;
  setIsInfoLoading: void;
  setReceipt: void;
  setAPIService: void;
  setOnChainService: void;
  setUbtNativePrice: void;
  setContractUbtBalance: void;
};

const mutations: MutationFuncs<Mutations, StakingUbtStoreState> = {
  setInfo(state, info: StakingUbtInfo | undefined): void {
    if (info === undefined) {
      state.info = info;
      return;
    }

    state.info = wrapCacheItem(info, INFO_TIME_EXPIRE);
  },
  setIsInfoLoading(state, isLoading: boolean): void {
    state.isInfoLoading = isLoading;
  },
  setReceipt(state, payload: SetStakingUbtReceiptPayload): void {
    const key = `${payload.year}/${payload.month}`;
    if (payload.receipt === undefined) {
      state.receipts.delete(key);
    } else {
      state.receipts.set(
        key,
        wrapCacheItem(payload.receipt, RECEIPT_TIME_EXPIRE)
      );
    }
  },
  setAPIService(state, service: MoverAPIStakingUbtService): void {
    state.apiService = service;
  },
  setOnChainService(state, service: StakingUbtOnChainService): void {
    state.onChainService = service;
  },
  setUbtNativePrice(state, price: string): void {
    state.ubtNativePrice = price;
  },
  setContractUbtBalance(state, balance: string): void {
    state.contractUbtBalance = balance;
  }
};

export type MutationType = typeof mutations;
export default mutations;
