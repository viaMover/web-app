import { RootStoreState } from '@/store/types';
import { Module } from 'vuex';
import { Modal, ModalsStoreState } from './types';

import actions from './actions';
import mutations from './mutations';

export default {
  namespaced: true,
  strict: true,
  state: {
    state: {
      [Modal.SavingsDeposit]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false
      },
      [Modal.SavingsWithdraw]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false
      },
      [Modal.SearchToken]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: true
      },
      [Modal.Swap]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false
      },
      [Modal.Transaction]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false
      },
      [Modal.TreasuryIncreaseBoost]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false
      },
      [Modal.TreasuryDecreaseBoost]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false
      },
      [Modal.TreasuryClaimAndBurn]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false
      }
    },
    stack: []
  },
  actions,
  mutations
} as Module<ModalsStoreState, RootStoreState>;
