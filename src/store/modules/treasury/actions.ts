import * as Sentry from '@sentry/vue';

import { MoverAPISmartTreasuryService } from '@/services/v2/api/mover/smart-treasury';
import {
  PowerCardTimings,
  SmartTreasuryOnChainService
} from '@/services/v2/on-chain/mover/smart-treasury';
import {
  getFromPersistStoreWithExpire,
  setToPersistStore
} from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  ensureAPIServiceExists,
  ensureOnChainServiceExists,
  SetTreasuryReceiptPayload,
  TreasuryGetReceiptPayload,
  TreasuryStoreState
} from './types';

type Actions = {
  restoreInfo: Promise<void>;
  restoreReceipts: Promise<void>;
  loadMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
  fetchPowercardData: Promise<void>;
  fetchTreasuryFreshData: Promise<void>;
  fetchTreasuryInfo: Promise<void>;
  fetchTreasuryReceipt: void;
  setOnChainService: void;
  setAPIService: void;
};

export const RECEIPT_TIME_EXPIRE = 10 * 60 * 1000; // 10 min
export const INFO_TIME_EXPIRE = 5 * 60 * 1000; // 5 min

const actions: ActionFuncs<
  Actions,
  TreasuryStoreState,
  MutationType,
  GetterType
> = {
  async restoreInfo({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    const info = await getFromPersistStoreWithExpire(
      rootState.account.currentAddress,
      'treasury',
      'info'
    );
    if (info !== undefined) {
      commit('setTreasuryInfo', info);
    }
  },
  async restoreReceipts({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    const end = new Date();
    end.setMonth(end.getMonth() - 12);
    for (
      let i = new Date();
      i.getTime() > end.getTime();
      i.setMonth(i.getMonth() - 1)
    ) {
      const receipt = await getFromPersistStoreWithExpire(
        rootState.account.currentAddress,
        'treasuryReceipts',
        `${i.getFullYear()}/${i.getMonth() + 1}`
      );
      if (receipt !== undefined) {
        commit('setTreasuryReceipt', {
          year: i.getFullYear(),
          month: i.getMonth() + 1,
          receipt: Promise.resolve(receipt)
        } as SetTreasuryReceiptPayload);
      }
    }
  },
  async loadMinimalInfo({ dispatch }): Promise<void> {
    const loadPowercardPromise = dispatch('fetchPowercardData');
    const treasuryFreshData = dispatch('fetchTreasuryFreshData');

    const promisesResults = await Promise.allSettled([
      treasuryFreshData,
      loadPowercardPromise
    ]);

    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      console.warn(
        'Failed to load Smart Treasury minimal info',
        promisesErrors
      );
      Sentry.captureException(promisesErrors);
    }
  },
  async loadInfo({ dispatch }): Promise<void> {
    await dispatch('restoreReceipts');
    await dispatch('restoreInfo');

    const loadMinimalInfoPromise = dispatch('loadMinimalInfo');
    const treasuryInfoPromise = dispatch('fetchTreasuryInfo');

    const promisesResults = await Promise.allSettled([
      loadMinimalInfoPromise,
      treasuryInfoPromise
    ]);

    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      console.warn('Failed to load Smart Treasury info', promisesErrors);
      Sentry.captureException(promisesErrors);
    }
  },
  async fetchPowercardData({ commit, state }): Promise<void> {
    if (!ensureOnChainServiceExists(state)) {
      return;
    }

    const powercardBalancePromise = state.onChainService.getPowercardBalance();
    const powercardStatePromise = state.onChainService.getPowercardState();
    const powercardTimingsPromise = powercardStatePromise.then(
      (powercardState) => {
        if (powercardState !== 'Staked') {
          return {
            activeTime: '0',
            cooldownTime: '0'
          } as PowerCardTimings;
        }

        return state.onChainService.getPowercardTimings();
      }
    );

    const [powercardBalance, powercardState, powercardTimings] =
      await Promise.all([
        powercardBalancePromise,
        powercardStatePromise,
        powercardTimingsPromise
      ]);

    commit('setPowercardBalance', powercardBalance);
    commit('setPowercardState', powercardState);
    if (powercardTimings !== undefined) {
      commit('setPowercardActiveTime', powercardTimings.activeTime);
      commit('setPowercardCooldownTime', powercardTimings.cooldownTime);
    }
  },
  async fetchTreasuryFreshData({ commit, state, getters }): Promise<void> {
    if (!ensureOnChainServiceExists(state)) {
      console.warn('On-chain service does not exist in store');
      return;
    }

    const [
      treasuryBalances,
      treasuryBonus,
      treasuryAPY,
      treasuryTotalStakedMove,
      treasuryTotalStakedMoveEthLP
    ] = await Promise.all([
      state.onChainService.getBalance(),
      state.onChainService.getBonusBalance(),
      state.onChainService.getAPY(
        getters.usdcNativePrice,
        getters.moveNativePrice
      ),
      state.onChainService.getTotalStakedMove(),
      state.onChainService.getTotalStakedMoveEthLP()
    ]);

    commit('setTreasuryBalanceMove', treasuryBalances.MoveBalance);
    commit('setTreasuryBalanceLP', treasuryBalances.LPBalance);
    commit('setTreasuryBonus', treasuryBonus);
    commit('setTreasuryAPY', treasuryAPY);
    commit('setTreasuryTotalStakedMove', treasuryTotalStakedMove);
    commit('setTreasuryTotalStakedMoveEthLP', treasuryTotalStakedMoveEthLP);
  },
  async fetchTreasuryInfo({
    commit,
    state,
    rootState,
    getters
  }): Promise<void> {
    try {
      if (!ensureAPIServiceExists(state)) {
        console.warn('API service does not exist in store');
        return;
      }

      if (getters.treasuryInfo !== undefined) {
        commit('setIsTreasuryInfoLoading', false);
        return;
      }

      commit('setIsTreasuryInfoLoading', true);
      commit('setTreasuryInfo', undefined);

      const info = await state.apiService.getInfo();

      commit('setTreasuryInfo', info);

      if (ensureAccountStateIsSafe(rootState.account)) {
        setToPersistStore(
          rootState.account.currentAddress,
          'treasury',
          'info',
          info,
          INFO_TIME_EXPIRE
        );
      }
    } catch (error) {
      console.error('Failed to fetch Smart Treasury info', error);
      Sentry.captureException(error);
    } finally {
      commit('setIsTreasuryInfoLoading', false);
    }
  },
  fetchTreasuryReceipt(
    { commit, state, rootState, getters },
    { year, month }: TreasuryGetReceiptPayload
  ): void {
    if (!ensureAPIServiceExists(state)) {
      console.warn('API service does not exist in store');
      return;
    }

    if (getters.treasuryReceipt(year, month) !== undefined) {
      return;
    }

    const receiptPromise = state.apiService.getReceipt(year, month);

    commit('setTreasuryReceipt', {
      year: year,
      month: month,
      receipt: receiptPromise
    } as SetTreasuryReceiptPayload);

    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    (async () => {
      for (const [key, value] of state.receipts.entries()) {
        if (value !== undefined) {
          try {
            await setToPersistStore(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              rootState.account!.currentAddress!,
              'treasuryReceipts',
              key,
              await value.data,
              RECEIPT_TIME_EXPIRE
            );
          } catch (error) {
            Sentry.addBreadcrumb({
              type: 'error',
              category: 'smart-treasury.store',
              message: 'An error occurred during setToPersistStore()',
              data: {
                error
              }
            });
          }
        }
      }
    })();
  },
  setOnChainService({ commit }, service: SmartTreasuryOnChainService): void {
    commit('setOnChainService', service);
  },
  setAPIService({ commit }, service: MoverAPISmartTreasuryService): void {
    commit('setAPIService', service);
  }
};

export type ActionType = typeof actions;
export default actions;
