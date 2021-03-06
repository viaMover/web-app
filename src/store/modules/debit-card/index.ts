import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { DebitCardStoreState } from './types';

export default {
  namespaced: true,
  state: {
    availableSkins: undefined,
    cardInfo: undefined,
    cardState: 'order_now',
    currentSkin: undefined,
    error: undefined,
    eventHistory: [],
    isLoading: false,
    loadingPromise: undefined,
    isInitialized: false,
    email: undefined,
    emailHash: undefined,
    emailSignature: undefined,
    orderState: undefined,
    phoneNumber: undefined,
    kycLink: undefined,
    onChainService: undefined
  },
  actions,
  getters,
  mutations
} as AugmentedModule<DebitCardStoreState, ActionType, GetterType, MutationType>;
