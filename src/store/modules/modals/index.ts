import { Module } from 'vuex';

import { isProduction } from '@/settings';
import { RootStoreState } from '@/store/types';

import actions from './actions';
import mutations from './mutations';
import { Modal, ModalsStoreState } from './types';

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
        resolver: undefined,
        needGasListener: true
      },
      [Modal.SavingsWithdraw]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined,
        needGasListener: true
      },
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
        resolver: undefined
      },
      [Modal.Swap]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined,
        needGasListener: true
      },
      [Modal.Transaction]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined,
        needGasListener: false
      },
      [Modal.TreasuryIncreaseBoost]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined,
        needGasListener: true
      },
      [Modal.TreasuryDecreaseBoost]: {
        isDisplayed: false,
        isVisible: false,
        stackDepth: -1,
        waitForResult: false,
        payload: undefined,
        resolver: undefined,
        needGasListener: true
      },
      [Modal.TreasuryClaimAndBurn]: {
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
  mutations
} as Module<ModalsStoreState, RootStoreState>;
