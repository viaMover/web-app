/* eslint-disable  @typescript-eslint/no-non-null-assertion */

import { ActionTree } from 'vuex';

import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';

import {
  getDiceData,
  getOlympusData,
  getSweetAndSourData,
  getUnexpectedMoveData,
  getVaultsData
} from '@/services/chain';
import { RootStoreState } from '@/store/types';

import { checkAccountStateIsReady } from '../../account/utils/state';
import { NFTStoreState } from './../types';

export default {
  async loadNFTInfo({ rootState, commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      if (!checkAccountStateIsReady(rootState)) {
        return;
      }

      const unexpectedMoveDataPromise = getUnexpectedMoveData(
        rootState!.account!.currentAddress!,
        rootState!.account!.networkInfo!.network,
        rootState!.account!.provider!.web3
      );

      const sweetAndSourDataPromise = getSweetAndSourData(
        rootState!.account!.currentAddress!,
        rootState!.account!.networkInfo!.network,
        rootState!.account!.provider!.web3
      );

      const olympusDataPromise = getOlympusData(
        rootState!.account!.currentAddress!,
        rootState!.account!.networkInfo!.network,
        rootState!.account!.provider!.web3
      );

      const vaultsDataPromise = getVaultsData(
        rootState!.account!.currentAddress!,
        rootState!.account!.networkInfo!.network,
        rootState!.account!.provider!.web3
      );

      const diceDataPromise = getDiceData(
        rootState!.account!.currentAddress!,
        rootState!.account!.networkInfo!.network,
        rootState!.account!.provider!.web3
      );

      try {
        const [
          unexpectedMoveRes,
          sweetAndSourRes,
          olympusRes,
          diceRes,
          vaultsRes
        ] = await Promise.allSettled([
          unexpectedMoveDataPromise,
          sweetAndSourDataPromise,
          olympusDataPromise,
          diceDataPromise,
          vaultsDataPromise
        ]);

        if (unexpectedMoveRes.status === 'fulfilled') {
          commit('setUnexpectedMoveData', unexpectedMoveRes.value);
        } else {
          logger.error(
            "Can't get data about Unexpected Move",
            unexpectedMoveRes.reason
          );
          Sentry.captureException("Can't get data about Unexpected Move");
        }

        if (sweetAndSourRes.status === 'fulfilled') {
          commit('setSweetAndSourData', sweetAndSourRes.value);
        } else {
          logger.error(
            "Can't get data about Sweet And Sour",
            sweetAndSourRes.reason
          );
          Sentry.captureException("Can't get data about Sweet And Sour");
        }

        if (olympusRes.status === 'fulfilled') {
          commit('setOlympusData', olympusRes.value);
        } else {
          logger.error("Can't get data about Olympus", olympusRes.reason);
          Sentry.captureException("Can't get data about Olympus");
        }

        if (diceRes.status === 'fulfilled') {
          commit('setDiceData', diceRes.value);
        } else {
          logger.error("Can't get data about Dice", diceRes.reason);
          Sentry.captureException("Can't get data about Dice");
        }

        if (vaultsRes.status === 'fulfilled') {
          if (vaultsRes.value !== undefined) {
            commit('setVaultsData', vaultsRes.value);
          }
        } else {
          logger.error("Can't get data about Vaults", vaultsRes.reason);
          Sentry.captureException("Can't get data about Vaults");
        }
      } catch (err) {
        console.error("can't load nft's data", err);
        Sentry.captureException(err);
      }
    } finally {
      commit('setIsLoading', false);
    }
  }
} as ActionTree<NFTStoreState, RootStoreState>;
