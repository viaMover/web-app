import { isProduction } from '@/settings';
import { AugmentedModule } from '@/store/types';

import actions, { ActionType } from './actions';
import getters, { GetterType } from './getters';
import mutations, { MutationType } from './mutations';
import { Modal, ModalsStoreState } from './types';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    state: {
      [Modal.SearchToken]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: true,
        payload: undefined,
        resolver: undefined,
        needGasListener: false
      },
      [Modal.SearchSkin]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: true,
        payload: undefined,
        resolver: undefined,
        needGasListener: false
      },
      [Modal.Swap]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined,
        needGasListener: true
      }
    },
    stack: []
  },
  actions,
  mutations,
  getters
} as AugmentedModule<ModalsStoreState, ActionType, GetterType, MutationType>;
