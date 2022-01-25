import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { NFTStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    isLoading: false,

    OlympusTotalClaimed: '0',
    OlympusStartTs: '0',
    OlympusEndTs: '0',
    OlympusBalance: '0',

    UnexpectedMoveTotalAmount: '0',
    UnexpectedMoveTotalClaimed: '0',
    UnexpectedMoveTotalExchanged: '0',
    UnexpectedMoveBalance: '0',

    SweetAndSourTotalAmount: '0',
    SweetAndSourTotalClaimed: '0',

    VaultsTotalAmount: '0',
    VaultsTotalClaimed: '0',

    DiceTotalClaimed: '0',

    nfts: []
  },
  actions,
  getters,
  mutations
} as AugmentedModule<NFTStoreState, ActionType, GetterType, MutationType>;
