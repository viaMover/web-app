import { getCoingeckoPlatform } from '@/services/coingecko/mapper';
import { getPriceByAddress } from '@/services/coingecko/tokens';
import { MoverAPIStakingUbtService } from '@/services/v2/api/mover/staking-ubt';
import { StakingUbtOnChainService } from '@/services/v2/on-chain/mover/staking-ubt';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
import {
  getFromPersistStoreWithExpire,
  setToPersistStore
} from '@/settings/persist/utils';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';
import { getUBTAssetData } from '@/wallet/references/data';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import {
  ensureAPIServiceExists,
  ensureOnChainServiceExists,
  SetStakingUbtReceiptPayload,
  StakingUbtGetReceiptPayload,
  StakingUbtStoreState
} from './types';

export type Actions = {
  restoreInfo: Promise<void>;
  restoreReceipts: Promise<void>;
  getMinimalInfo: Promise<void>;
  loadInfo: Promise<void>;
  getInfo: Promise<void>;
  getReceipt: Promise<void>;
  setAPIService: void;
  setOnChainService: void;
};

export const RECEIPT_TIME_EXPIRE = 10 * 60 * 1000; // 10 min
export const INFO_TIME_EXPIRE = 5 * 60 * 1000; // 5 min

const actions: ActionFuncs<
  Actions,
  StakingUbtStoreState,
  MutationType,
  GetterType
> = {
  async restoreInfo({ commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    const info = await getFromPersistStoreWithExpire(
      rootState.account.currentAddress,
      'stakingUbt',
      'info'
    );
    if (info !== undefined) {
      commit('setInfo', info);
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
        'stakingUbtReceipts',
        `${i.getFullYear()}/${i.getMonth() + 1}`
      );
      if (receipt !== undefined) {
        commit('setReceipt', {
          year: i.getFullYear(),
          month: i.getMonth() + 1,
          receipt: Promise.resolve(receipt)
        } as SetStakingUbtReceiptPayload);
      }
    }
  },
  async loadInfo({ dispatch }): Promise<void> {
    const restoreInfoPromise = dispatch('restoreInfo');
    const restoreReceiptsPromise = dispatch('restoreReceipts');
    const getMinimalInfoPromise = dispatch('getMinimalInfo');
    const getInfoPromise = restoreInfoPromise.then(() => dispatch('getInfo'));

    await Promise.allSettled([
      restoreInfoPromise,
      restoreReceiptsPromise,
      getMinimalInfoPromise,
      getInfoPromise
    ]);
  },
  async getMinimalInfo({ state, commit, rootState }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      console.warn('Account state is not ready');
      return;
    }

    const ubtAssetData = getUBTAssetData(rootState.account.networkInfo.network);

    try {
      const ubtNativePrice = await getPriceByAddress(
        getCoingeckoPlatform(rootState.account.networkInfo.network),
        [ubtAssetData.address],
        [rootState.account.nativeCurrency]
      );
      if (!ubtNativePrice.isError) {
        commit(
          'setUbtNativePrice',
          ubtNativePrice.result[ubtAssetData.address]?.[
            rootState.account.nativeCurrency
          ]
        );
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'getMinimalInfo.staking-ubt.store',
        message: 'Failed to get UBT native price',
        data: {
          error
        }
      });
    }

    if (!ensureOnChainServiceExists(state)) {
      console.warn('On-chain service does not exist in store');
      return;
    }

    try {
      const stakedBalance = await state.onChainService.getStakedBalance();
      commit('setContractUbtBalance', stakedBalance);
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'getMinimalInfo.staking-ubt.store',
        message: 'Failed to get staked UBT balance',
        data: {
          error
        }
      });
    }
  },
  async getInfo({ state, commit, getters, rootState }): Promise<void> {
    try {
      if (!ensureAPIServiceExists(state)) {
        console.warn('API service does not exist in store');
        return;
      }

      if (getters.info !== undefined) {
        return;
      }

      commit('setIsInfoLoading', true);
      commit('setInfo', undefined);

      const info = await state.apiService.getInfo();
      commit('setInfo', info);

      if (ensureAccountStateIsSafe(rootState.account)) {
        // noinspection ES6MissingAwait
        setToPersistStore(
          rootState.account.currentAddress,
          'stakingUbt',
          'info',
          info,
          INFO_TIME_EXPIRE
        );
      }
    } catch (error) {
      captureSentryException(error);
    } finally {
      commit('setIsInfoLoading', false);
    }
  },
  async getReceipt(
    { state, commit, getters, rootState },
    { year, month }: StakingUbtGetReceiptPayload
  ): Promise<void> {
    if (!ensureAPIServiceExists(state)) {
      console.warn('API service does not exist in store');
      return;
    }

    if (getters.receipt(year, month) !== undefined) {
      return;
    }

    const receiptPromise = state.apiService.getReceipt(year, month);

    commit('setReceipt', {
      year: year,
      month: month,
      receipt: receiptPromise
    } as SetStakingUbtReceiptPayload);

    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    // noinspection ES6MissingAwait
    (async () => {
      for (const [key, value] of state.receipts.entries()) {
        if (value !== undefined) {
          try {
            await setToPersistStore(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              rootState.account!.currentAddress!,
              'stakingUbtReceipts',
              key,
              await value.data,
              RECEIPT_TIME_EXPIRE
            );
          } catch (error) {
            addSentryBreadcrumb({
              type: 'error',
              category: 'getReceipt.staking-ubt.store',
              message: 'An error occurred during setToPersistStore()',
              data: {
                error,
                key,
                value
              }
            });
          }
        }
      }
    })();
  },
  setAPIService({ commit }, service: MoverAPIStakingUbtService): void {
    commit('setAPIService', service);
  },
  setOnChainService({ commit }, service: StakingUbtOnChainService): void {
    commit('setOnChainService', service);
  }
};

export type ActionType = typeof actions;
export default actions;
