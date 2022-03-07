import Web3 from 'web3';

import { MoverAPISavingsService } from '@/services/v2/api/mover/savings/MoverAPISavingsService';
import { SavingsOnChainService } from '@/services/v2/on-chain/mover/savings/SavingsOnChainService';
import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';
import { Network } from '@/utils/networkTypes';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { SavingsStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isSavingsInfoLoading: true,
    savingsInfo: undefined,

    receipts: new Map(),

    savingsBalance: undefined,
    savingsAPY: undefined,
    savingsDPY: undefined,
    apiService: new MoverAPISavingsService('', Network.mainnet),
    onChainService: new SavingsOnChainService('', Network.mainnet, new Web3())
  },
  actions,
  getters,
  mutations
} as AugmentedModule<SavingsStoreState, ActionType, GetterType, MutationType>;
