import * as Sentry from '@sentry/vue';

import {
  getPowercardState,
  getTotalStakedMove,
  getTotalStakedMoveEthLP,
  getTreasuryAPY,
  getTreasuryBalance,
  getTreasuryBonus,
  powercardBalance
} from '@/services/chain';
import { getPowercardTimings } from '@/services/chain/treasury/powercard';
import { getTreasuryInfo, getTreasuryReceipt } from '@/services/mover';
import { isError } from '@/services/responses';
import { checkAccountStateIsReady } from '@/store/modules/account/utils/state';
import {
  getFromPersistStoreWithExpire,
  setToPersistStore
} from '@/store/modules/savings/utils';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  SetTreasuryReceiptPayload,
  TreasuryGetReceiptPayload,
  TreasuryStoreState
} from './types';

type Actions = {
  restoreReceipts: Promise<void>;
  loadMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
  fetchPowercardData: Promise<void>;
  fetchTreasuryFreshData: Promise<void>;
  fetchTreasuryInfo: Promise<void>;
  fetchTreasuryReceipt: Promise<void>;
};

const actions: ActionFuncs<
  Actions,
  TreasuryStoreState,
  MutationType,
  GetterType
> = {
  async restoreReceipts({ commit }): Promise<void> {
    const end = new Date();
    end.setMonth(end.getMonth() - 12);
    for (
      let i = new Date();
      i.getTime() > end.getTime();
      i.setMonth(i.getMonth() - 1)
    ) {
      const receipt = await getFromPersistStoreWithExpire(
        'treasuryReceipts',
        `${i.getFullYear()}/${i.getMonth() + 1}`
      );
      commit('setTreasuryReceipt', {
        year: i.getFullYear(),
        month: i.getMonth() + 1,
        receipt: Promise.resolve(receipt)
      } as SetTreasuryReceiptPayload);
    }
  },
  async loadMinimalInfo({ dispatch }): Promise<void> {
    const loadPowercardPromise = dispatch('fetchPowercardData');
    const treasuryFreshData = dispatch('fetchTreasuryFreshData');
    const restoreReceiptsPromise = dispatch('restoreReceipts');

    const promisesResults = await Promise.allSettled([
      treasuryFreshData,
      loadPowercardPromise,
      restoreReceiptsPromise
    ]);

    const promisesErrors = promisesResults
      .filter((p): p is PromiseRejectedResult => p.status === 'rejected')
      .map((p) => p.reason);

    if (promisesErrors.length > 0) {
      Sentry.captureException(promisesErrors);
    }
  },
  async loadInfo({ dispatch }): Promise<void> {
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
      Sentry.captureException(promisesErrors);
    }
  },
  async fetchPowercardData({ commit, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    const powercardBalanceData = await powercardBalance(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    commit('setPowercardBalance', powercardBalanceData);

    const getPowercardStateData = await getPowercardState(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    commit('setPowercardState', getPowercardStateData);

    if (getPowercardStateData === 'Staked') {
      const getPowercardTimingsData = await getPowercardTimings(
        rootState.account!.currentAddress!,
        rootState.account!.networkInfo!.network,
        rootState.account!.provider!.web3
      );

      commit('setPowercardActiveTime', getPowercardTimingsData.activeTime);
      commit('setPowercardCooldownTime', getPowercardTimingsData.cooldownTime);
    }
  },
  async fetchTreasuryFreshData({ commit, getters, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    const getTreasuryBalancesPromise = getTreasuryBalance(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTreasuryBonusPromise = getTreasuryBonus(
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTreasuryAPYPromise = getTreasuryAPY(
      getters.usdcNativePrice,
      getters.moveNativePrice,
      rootState.account!.currentAddress!,
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTotalStakedMovePromise = getTotalStakedMove(
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const getTotalStakedMoveEthLPPromise = getTotalStakedMoveEthLP(
      rootState.account!.networkInfo!.network,
      rootState.account!.provider!.web3
    );

    const [
      treasuryBalances,
      treasuryBonus,
      treasuryAPY,
      treasuryTotalStakedMove,
      treasuryTotalStakedMoveEthLP
    ] = await Promise.all([
      getTreasuryBalancesPromise,
      getTreasuryBonusPromise,
      getTreasuryAPYPromise,
      getTotalStakedMovePromise,
      getTotalStakedMoveEthLPPromise
    ]);

    commit('setTreasuryBalanceMove', treasuryBalances.MoveBalance);
    commit('setTreasuryBalanceLP', treasuryBalances.LPBalance);
    commit('setTreasuryBonus', treasuryBonus);
    commit('setTreasuryAPY', treasuryAPY);
    commit('setTreasuryTotalStakedMove', treasuryTotalStakedMove);
    commit('setTreasuryTotalStakedMoveEthLP', treasuryTotalStakedMoveEthLP);
  },
  async fetchTreasuryInfo({ commit, rootState }): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    commit('setIsTreasuryInfoLoading', true);
    commit('setTreasuryInfoError', undefined);
    commit('setTreasuryInfo', undefined);

    const info = await getTreasuryInfo(rootState.account!.currentAddress!);

    if (isError(info)) {
      commit('setTreasuryInfoError', info.error);
      commit('setIsTreasuryInfoLoading', false);
      Sentry.captureException(`can't get treasury info: ${info.error}`);
      return;
    }

    commit('setTreasuryInfo', info.result);
    commit('setIsTreasuryInfoLoading', false);
  },
  async fetchTreasuryReceipt(
    { commit, state, rootState, getters },
    { year, month }: TreasuryGetReceiptPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      return;
    }

    if (getters.treasuryReceipt(year, month) !== undefined) {
      return;
    }

    const receiptPromise = getTreasuryReceipt(
      rootState.account!.currentAddress!,
      year,
      month
    ).then((item) => {
      if (isError(item)) {
        throw new Error(item.error);
      }

      return item.result;
    });

    commit('setTreasuryReceipt', {
      year: year,
      month: month,
      receipt: receiptPromise
    } as SetTreasuryReceiptPayload);

    (async () => {
      for (const [key, value] of state.receipts.entries()) {
        if (value !== undefined) {
          await setToPersistStore(
            'treasuryReceipts',
            key,
            await value.data,
            Date.now() + 600000
          );
        }
      }
    })().then();
  }
};

export type ActionType = typeof actions;
export default actions;
