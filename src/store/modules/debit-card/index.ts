import { AugmentedModule } from '@/store/types';
import { toWei } from '@/utils/bigmath';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { DebitCardStoreState } from './types';

export const initialState: DebitCardStoreState = {
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
  wxBTRFLYrealIndex: toWei(1, 9),
  gALCXToALCXMultiplier: toWei(1.2, 18),
  onChainService: undefined
};

export default {
  namespaced: true,
  state: () => initialState,
  actions,
  getters,
  mutations
} as AugmentedModule<DebitCardStoreState, ActionType, GetterType, MutationType>;
