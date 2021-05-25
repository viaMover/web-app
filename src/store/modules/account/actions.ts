import { EtherscanTransaction } from './../../../services/etherscan/transactions';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { AccountStoreState, AccountData, Transaction } from './types';
import { GetTransactions } from '@/services/etherscan/transactions';

export default {
  async setCurrentWallet({ commit }, address: string): Promise<void> {
    commit('setCurrentWallet', address);
  },

  async refreshWallet({ commit, state }): Promise<void> {
    if (!state.currentAddress) {
      return;
    }

    console.info('Updating txns from Etherscan');
    const res = await GetTransactions(state.currentAddress);
    if (res.isError || res.result === undefined) {
      commit(
        'setRefreshEror',
        `Can't get transactions from Etherscan: ${res.errorMessage}`
      );
      return;
    }

    const newTransactions = res.result.map((et: EtherscanTransaction) => {
      return {
        blockNumber: et.blockNumber,
        hash: et.hash,
        timeStamp: parseInt(et.timeStamp),
        nonce: et.nonce,
        from: et.from,
        to: et.to,
        value: et.value
      } as Transaction;
    });
    commit('updateWalletTransactions', newTransactions);
  },

  clearProvider({ commit, state }): void {
    if (state.providerBeforeClose) {
      state.providerBeforeClose();
    }
    commit('setAccountData', {
      addresses: [] as Array<string>,
      web3Inst: null,
      balance: null,
      networkId: null
    } as AccountData);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
