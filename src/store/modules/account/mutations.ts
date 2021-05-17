import { MutationTree } from 'vuex';
import { AccountStoreState } from './types';

export default {
  setCurrentWallet(state, address): void {
    state.currentAddress = address;
  }
} as MutationTree<AccountStoreState>;
