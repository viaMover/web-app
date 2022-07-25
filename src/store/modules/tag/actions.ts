import { MoverAPIError } from '@/services/v2/api/mover';
import { ErrorCode, MoverAPITagService } from '@/services/v2/api/mover/tag';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import { ActionFuncs } from '@/store/types';

import { GetterType } from './getters';
import { MutationType } from './mutations';
import { reserveTagInput, TagStoreState } from './types';

export type Actions = {
  loadInfo: Promise<void>;
  reserveTag: Promise<void>;
  toggleIsBannerVisible: void;
};

const actions: ActionFuncs<Actions, TagStoreState, MutationType, GetterType> = {
  async loadInfo({ state, rootState, commit }): Promise<void> {
    try {
      commit('setIsLoading', true);

      let service = state.apiService;
      if (service === undefined) {
        if (!ensureAccountStateIsSafe(rootState.account)) {
          addSentryBreadcrumb({
            type: 'error',
            category: 'loadInfo.actions.tag.store',
            message: 'Account state is not ready'
          });
          return;
        }

        service = new MoverAPITagService(
          rootState.account.currentAddress,
          rootState.account.networkInfo.network,
          rootState.account.provider.web3
        );
        commit('setAPIService', service);
      }

      const result = await service.lookupTag();
      commit('setTagAndSig', { tag: result.name, sig: result.sig });
    } catch (error) {
      if (
        error instanceof MoverAPIError &&
        error.shortMessage === ErrorCode.TagNotFound
      ) {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'loadInfo.actions.tag.store',
          message: 'Tag not found',
          data: {
            error
          }
        });
        return;
      }

      addSentryBreadcrumb({
        type: 'error',
        category: 'loadInfo.actions.tag.store',
        message: 'Failed to load tag info',
        data: {
          error
        }
      });
      captureSentryException(error);
    } finally {
      commit('setIsLoading', false);
    }
  },
  async reserveTag(
    { commit, state, rootState },
    payload: reserveTagInput
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'reserveTag.actions.tag.store',
        message: 'Account state is not ready'
      });
      return;
    }

    let service = state.apiService;
    if (service === undefined) {
      service = new MoverAPITagService(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );
      commit('setAPIService', service);
    }

    try {
      const response = await service.reserveTag(payload.tag, payload.partner);
      commit('setTagAndSig', { tag: response.name, sig: response.sig });
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'reserveTag.actions.tag.store',
        message: 'Failed to reserve tag',
        data: {
          error
        }
      });
      throw error;
    }
  },
  toggleIsBannerVisible({ commit }): void {
    commit('toggleIsBannerVisible');
  }
};

export type ActionType = typeof actions;
export default actions;
