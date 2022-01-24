import { EthereumInfo } from '@/services/mover';
import { MutationFuncs } from '@/store/types';

import { EarningsEthereumStoreState, SetEthereumReceiptPayload } from './types';

enum Mutations {
  setIsLoading,
  setEthereumAPY,
  setEthereumBalance,
  setEthereumInfo,
  setEthereumInfoError,
  setIsEthereumInfoLoading,
  setEthereumReceipt,
  setEthereumReceiptError,
  setIsEthereumReceiptLoading
}

const mutations: MutationFuncs<typeof Mutations, EarningsEthereumStoreState> = {
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
};

export type MutationType = typeof mutations;
export default mutations;
