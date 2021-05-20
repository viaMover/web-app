import { MutationTree } from 'vuex';
import { AccountStoreState, AccountData } from './types';

export default {
  setCurrentWallet(state, address): void {
    state.currentAddress = address;
  },
  setProviderBeforeCloseCb(state, cb): void {
    state.providerBeforeClose = cb;
  },
  setAccountData(state, ad: AccountData): void {
    state.addresses = ad.addresses;
    if (ad.addresses) {
      state.currentAddress = ad.addresses[0];
    }
    state.balance = ad.balance;
    state.web3 = ad.web3Inst;
    state.networkId = ad.networkId;
  }
} as MutationTree<AccountStoreState>;
