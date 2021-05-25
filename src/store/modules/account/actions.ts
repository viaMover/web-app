import { EtherscanTransaction } from './../../../services/etherscan/transactions';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import { AccountStoreState, AccountData, Transaction, Token } from './types';
import { GetTransactions } from '@/services/etherscan/transactions';
import { EthplorerToken, GetWalletInfo } from '@/services/ethplorer/tokens';

export default {
  async setCurrentWallet({ commit }, address: string): Promise<void> {
    commit('setCurrentWallet', address);
  },

  async refreshWallet({ commit, state }): Promise<void> {
    if (!state.currentAddress) {
      return;
    }
    console.info('Updating wallet tokens from Etherscan');

    const walletRes = await GetWalletInfo(state.currentAddress);
    if (walletRes.isError || walletRes.result === undefined) {
      commit(
        'setRefreshEror',
        `Can't get wallet info from ethplorer: ${walletRes.errorMessage}`
      );
      return;
    }

    const walletTokens = walletRes.result.tokens.map((et: EthplorerToken) => {
      return {
        address: et.tokenInfo.address,
        decimals: parseInt(et.tokenInfo.decimals),
        balance: et.rawBalance,
        name: et.tokenInfo.name,
        priceUSD: et.tokenInfo.price.rate,
        symbol: et.tokenInfo.symbol
      } as Token;
    });
    commit('setWalletTokens', walletTokens);

    console.info('Updating txns from Etherscan');
    const txRes = await GetTransactions(state.currentAddress);
    if (txRes.isError || txRes.result === undefined) {
      commit(
        'setRefreshEror',
        `Can't get transactions from Etherscan: ${txRes.errorMessage}`
      );
      return;
    }

    const newTransactions = txRes.result.map((et: EtherscanTransaction) => {
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
