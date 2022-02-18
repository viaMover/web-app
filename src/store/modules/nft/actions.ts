import { logger } from '@sentry/utils';
import * as Sentry from '@sentry/vue';

import {
  claimAndExchangeUnexpectedMove,
  claimDice,
  claimOlympus,
  claimSweetAndSour,
  claimUnexpectedMove,
  exchangeUnexpectedMove,
  getDiceData,
  getOlympusData,
  getSweetAndSourData,
  getUnexpectedMoveData,
  getVaultsData
} from '@/services/chain';
import { claimVaults } from '@/services/chain/nft/vaults/vaults';
import { ensureAccountStateIsSafe } from '@/store/modules/account/types';
import {
  ChangePayload,
  ClaimPayload,
  DicePayload,
  NFTStoreState
} from '@/store/modules/nft/types';
import { ActionFuncs } from '@/store/types';
import { greaterThan, lessThan } from '@/utils/bigmath';
import { currentTimestamp } from '@/utils/time';

import { GetterType } from './getters';
import { MutationType } from './mutations';

type Actions = {
  loadNFTInfo: Promise<void>;
  fetchOlympusData: Promise<void>;
  fetchUnexpectedMoveData: Promise<void>;
  fetchSweetAndSourData: Promise<void>;
  fetchVaultsData: Promise<void>;
  fetchDiceData: Promise<void>;
  checkOlympusClaimable: boolean;
  claimOlympus: Promise<void>;
  claimVaults: Promise<void>;
  claimDice: Promise<void>;
  claimSweetAndSour: Promise<void>;
  claimUnexpectedMove: Promise<void>;
  claimAndExchangeUnexpectedMove: Promise<void>;
  exchangeUnexpectedMove: Promise<void>;
};

const actions: ActionFuncs<Actions, NFTStoreState, MutationType, GetterType> = {
  async loadNFTInfo({ rootState, commit, dispatch }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    commit('setIsLoading', true);

    const fetchUnexpectedMoveDataPromise = dispatch('fetchUnexpectedMoveData');
    const fetchSweetAndSourDataPromise = dispatch('fetchSweetAndSourData');
    const fetchOlympusDataPromise = dispatch('fetchOlympusData');
    const fetchVaultsDataPromise = dispatch('fetchVaultsData');
    const fetchDiceDataPromise = dispatch('fetchDiceData');

    await Promise.allSettled([
      fetchUnexpectedMoveDataPromise,
      fetchSweetAndSourDataPromise,
      fetchOlympusDataPromise,
      fetchVaultsDataPromise,
      fetchDiceDataPromise
    ]);

    commit('setIsLoading', false);
  },
  async fetchOlympusData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getOlympusData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setOlympusData', data);
    } catch (e) {
      logger.error("Can't get data about Olympus", e);
      Sentry.captureException(e);
    }
  },
  async fetchSweetAndSourData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getSweetAndSourData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setSweetAndSourData', data);
    } catch (e) {
      logger.error("Can't get data about Sweet and Sour", e);
      Sentry.captureException(e);
    }
  },
  async fetchVaultsData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getVaultsData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setVaultsData', data);
    } catch (e) {
      logger.error("Can't get data about Vaults", e);
      Sentry.captureException(e);
    }
  },
  async fetchUnexpectedMoveData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getUnexpectedMoveData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setUnexpectedMoveData', data);
    } catch (e) {
      logger.error("Can't get data about Unexpected Move", e);
      Sentry.captureException(e);
    }
  },
  async fetchDiceData({ rootState, commit }): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      return;
    }

    try {
      const data = await getDiceData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      commit('setDiceData', data);
    } catch (e) {
      logger.error("Can't get data about Dice", e);
      Sentry.captureException("Can't get data about Dice");
    }
  },
  checkOlympusClaimable({ state }): boolean {
    return (
      lessThan(currentTimestamp(), state.movingWithOlympus.meta.endTs) &&
      greaterThan(currentTimestamp(), state.movingWithOlympus.meta.startTs)
    );
  },
  async claimOlympus({ rootState }, payload: ChangePayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    const fastGasPrice = rootState.account.gasPrices?.FastGas;

    await claimOlympus(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimVaults({ rootState }, payload: ChangePayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    const fastGasPrice = rootState.account.gasPrices?.FastGas;

    await claimVaults(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimDice({ rootState }, payload: DicePayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    const fastGasPrice = rootState.account.gasPrices?.FastGas;

    await claimDice(
      payload.diceType,
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimSweetAndSour({ rootState }, payload: ClaimPayload): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    const fastGasPrice = rootState.account.gasPrices?.FastGas;

    await claimSweetAndSour(
      rootState.account.currentAddress,
      payload.signature,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    const fastGasPrice = rootState.account.gasPrices?.FastGas;

    await claimUnexpectedMove(
      rootState.account.currentAddress,
      payload.signature,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimAndExchangeUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    const fastGasPrice = rootState.account.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await claimAndExchangeUnexpectedMove(
      rootState.account.currentAddress,
      payload.signature,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      fastGasPrice.price,
      payload.changeStep
    );
  },
  async exchangeUnexpectedMove(
    { rootState },
    payload: ChangePayload
  ): Promise<void> {
    if (!ensureAccountStateIsSafe(rootState.account)) {
      throw new Error('account state is not ready');
    }

    const fastGasPrice = rootState.account.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await exchangeUnexpectedMove(
      rootState.account.currentAddress,
      rootState.account.networkInfo.network,
      rootState.account.provider.web3,
      fastGasPrice.price,
      payload.changeStep
    );
  }
};

export type ActionType = typeof actions;
export default actions;
