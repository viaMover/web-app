import { GetTokensPrice } from './../../../../services/thegraph/api';
import { InitExplorer } from './../../../../services/zerion/explorer';
import { ActionTree } from 'vuex';
import { RootStoreState } from '@/store/types';
import {
  AccountStoreState,
  AccountData,
  TokenWithBalance,
  ProviderNames,
  ProviderData
} from './../types';
import { GetTransactions } from '@/services/etherscan/transactions';
import { EthplorerToken, GetWalletInfo } from '@/services/ethplorer/tokens';
import { Network } from '@/utils/networkTypes';
import { provider } from 'web3-core';
import Web3 from 'web3';

export type RefreshWalletPayload = {
  injected: boolean;
  startZerion: boolean;
};

export type InitWalletPayload = {
  provider: provider;
  providerName: ProviderNames;
  providerBeforeCloseCb: () => void;
  injected: boolean;
};

export default {
  async setCurrentWallet({ commit }, address: string): Promise<void> {
    commit('setCurrentWallet', address);
  },

  async initWallet(
    { commit, state, dispatch },
    payload: InitWalletPayload
  ): Promise<void> {
    try {
      const web3Inst = new Web3(payload.provider);
      commit('setProvider', {
        providerBeforeClose: payload.providerBeforeCloseCb,
        providerName: payload.providerName,
        web3: web3Inst
      } as ProviderData);

      dispatch('refreshWallet', {
        injected: payload.injected,
        startZerion: true
      } as RefreshWalletPayload);
    } catch (err) {
      console.log("can't init the wallet");
      console.log(err);
    }
  },

  async refreshWallet(
    { commit, state },
    payload: RefreshWalletPayload
  ): Promise<void> {
    if (state.provider === undefined) {
      console.info("can't refresh wallet due to empty provider");
      return;
    }

    console.info('getting accounts...');
    let accounts;
    if (payload.injected) {
      accounts = await state.provider.web3.eth.requestAccounts();
    } else {
      accounts = await state.provider.web3.eth.getAccounts();
    }
    console.info('accounts: ', accounts);

    let balance = '';
    if (accounts) {
      balance = await state.provider.web3.eth.getBalance(accounts[0]);
    }
    console.info('balance of the current account:', balance);

    const chainId = await state.provider.web3.eth.getChainId();

    commit('setAccountData', {
      addresses: accounts,
      balance: balance,
      networkId: chainId
    } as AccountData);

    if (!state.currentAddress || !state.networkInfo) {
      console.info("can't refresh wallet due to empty address");
      return;
    }
    if (!state.networkInfo) {
      console.info("can't refresh wallet due to empty networkInfo");
      return;
    }

    console.info('Updating wallet tokens from Etherscan...');
    if (state.networkInfo.network === Network.mainnet) {
      if (payload.startZerion) {
        console.log('Starting Zerion...');
        InitExplorer(
          state.currentAddress,
          'usd',
          (txns: Array<Transaction>) => {
            commit('updateWalletTransactions', txns);
          }
        );
      }

      //
      // console.info('Use ethplorer for mainnet wallet...');
      // const walletRes = await GetWalletInfo(state.currentAddress);
      // if (walletRes.isError || walletRes.result === undefined) {
      // commit(
      //     'setRefreshEror',
      //     `Can't get wallet info from ethplorer: ${walletRes.errorMessage}`
      // );
      // return;
      // }
      // const walletTokens = walletRes.result.tokens.map((et: EthplorerToken) => {
      // return {
      //     address: et.tokenInfo.address,
      //     decimals: parseInt(et.tokenInfo.decimals),
      //     balance: et.rawBalance,
      //     name: et.tokenInfo.name,
      //     priceUSD: et.tokenInfo.price.rate,
      //     symbol: et.tokenInfo.symbol
      // } as TokenWithBalance;
      // });
      // commit('setWalletTokens', walletTokens);
      //
    } else {
      console.info('Not mainnet - should use balancer');
    }

    //const res = await GetTokensPrice([state.allTokens[0].address]);
    //console.log(res);
    //
    // console.info('Updating txns from Etherscan');
    // const txRes = await GetTransactions(
    // state.currentAddress,
    // state.networkInfo.network
    // );
    // if (txRes.isError || txRes.result === undefined) {
    // commit(
    //     'setRefreshEror',
    //     `Can't get transactions from Etherscan: ${txRes.errorMessage}`
    // );
    // return;
    // }
    //
    // commit('updateWalletTransactions', txRes.result);
    //
  },

  disconnectWallet({ commit, state }): void {
    if (state.provider) {
      state.provider.providerBeforeClose();
    }
    commit('clearWalletData');
  }
} as ActionTree<AccountStoreState, RootStoreState>;
