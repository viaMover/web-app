import { EtherscanTransaction } from './../../../services/etherscan/transactions';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import {
  AccountStoreState,
  AccountData,
  Transaction,
  TokenWithBalance
} from './types';
import { GetTransactions } from '@/services/etherscan/transactions';
import { EthplorerToken, GetWalletInfo } from '@/services/ethplorer/tokens';
import { Network } from '@/utils/networkTypes';

export default {
  async setCurrentWallet({ commit }, address: string): Promise<void> {
    commit('setCurrentWallet', address);
  },

  async refreshWallet({ commit, state }): Promise<void> {
    if (!state.currentAddress || !state.networkInfo) {
      console.info("can't refresh wallet due to empty address");
      return;
    }
    if (!state.networkInfo) {
      console.info("can't refresh wallet due to empty networkInfo");
      return;
    }
    console.info('Updating wallet tokens from Etherscan');
    if (state.networkInfo.network === Network.mainnet) {
      console.info('Use ethplorer for mainnet wallet...');
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
        } as TokenWithBalance;
      });
      commit('setWalletTokens', walletTokens);
    } else {
      console.info('Not mainnet - should use balancer');
    }

    console.info('Updating txns from Etherscan');
    const txRes = await GetTransactions(
      state.currentAddress,
      state.networkInfo.network
    );
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
      web3Inst: undefined,
      balance: undefined,
      networkId: undefined
    } as AccountData);
  }
} as ActionTree<AccountStoreState, RootStoreState>;
