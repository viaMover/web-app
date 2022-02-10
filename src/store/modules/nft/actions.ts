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
  async loadNFTInfo({ rootState, commit }): Promise<void> {
    commit('setIsLoading', true);
    try {
      if (!ensureAccountStateIsSafe(rootState.account)) {
        return;
      }

      const unexpectedMoveDataPromise = getUnexpectedMoveData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      const sweetAndSourDataPromise = getSweetAndSourData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      const olympusDataPromise = getOlympusData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      const vaultsDataPromise = getVaultsData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
      );

      const diceDataPromise = getDiceData(
        rootState.account.currentAddress,
        rootState.account.networkInfo.network,
        rootState.account.provider.web3
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
        console.error("can't load nft data", err);
        Sentry.captureException(err);
      }
    } finally {
      commit('setIsLoading', false);
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
