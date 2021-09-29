import { RootStoreState } from '@/store/types';
import { Module } from 'vuex';
import { Modal, ModalsStoreState } from './types';

import actions from './actions';
import mutations from './mutations';
import { isProduction } from '@/settings';

export default {
  namespaced: true,
  strict: !isProduction(),
  state: {
    state: {
      [Modal.SavingsDeposit]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined
      },
      [Modal.SavingsWithdraw]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined
      },
      [Modal.SearchToken]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: true,
        payload: undefined,
        resolver: undefined
      },
      [Modal.Swap]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined
      },
      [Modal.Transaction]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined
      },
      [Modal.TreasuryIncreaseBoost]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined
      },
      [Modal.TreasuryDecreaseBoost]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined
      },
      [Modal.TreasuryClaimAndBurn]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined
      }
    },
    stack: []
  },
  actions,
  mutations
} as Module<ModalsStoreState, RootStoreState>;
