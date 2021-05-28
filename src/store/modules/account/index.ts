import { NetworkInfo } from './../../../utils/networkTypes';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { Module } from 'vuex';
import { AccountStoreState, Token } from '@/store/modules/account/types';
import { RootStoreState } from '@/store/types';
import assetList from '@/../data/assetList.json';
import { getTokenLogo } from '@/services/trustwallet/logo';

export default {
  namespaced: true,
  strict: true,
  state: {
    addresses: [],
    currentAddress: undefined,
    transactions: [],
    tokens: [],
    web3: undefined,
    balance: undefined,
    networkInfo: undefined,
    // eslint-disable-next-line
    providerBeforeClose: () => {},
    allTokens: assetList.map(
      (asset) =>
        ({
          address: asset.id,
          decimals: asset.decimals,
          symbol: asset.symbol,
          name: asset.name,
          logo: getTokenLogo(asset.id)
        } as Token)
    ),
    refreshError: undefined
  },
  actions,
  getters,
  mutations
} as Module<AccountStoreState, RootStoreState>;
