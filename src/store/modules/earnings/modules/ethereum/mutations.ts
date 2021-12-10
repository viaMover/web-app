import { MutationTree } from 'vuex';

import { EthereumInfo } from '@/services/mover';

import { EarningsEthereumStoreState, SetEthereumReceiptPayload } from './types';

export default {
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  setEthereumAPY(state, apy: string | undefined): void {
    state.ethereumAPY = apy;
  },
  setEthereumBalance(state, balance: string | undefined): void {
    state.ethereumBalance = balance;
  },
  setEthereumInfo(state, info: EthereumInfo | undefined): void {
    state.ethereumInfo = info;
  },
  setEthereumInfoError(state, error: string | undefined): void {
    state.ethereumInfoError = error;
  },
  setIsEthereumInfoLoading(state, status: boolean): void {
    state.isEthereumInfoLoading = status;
  },
  setEthereumReceipt(state, payload: SetEthereumReceiptPayload): void {
    state.ethereumReceiptCache[`${payload.year}/${payload.month}`] =
      payload.receipt;
  },
  setEthereumReceiptError(state, error: string | undefined): void {
    state.ethereumInfoError = error;
  },
  setIsEthereumReceiptLoading(state, status: boolean): void {
    state.isEthereumInfoLoading = status;
  }
} as MutationTree<EarningsEthereumStoreState>;
