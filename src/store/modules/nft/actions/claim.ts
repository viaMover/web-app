/* eslint-disable  @typescript-eslint/no-non-null-assertion */

import { greaterThan, lessThan } from '@/utils/bigmath';
import { currentTimestamp } from '@/utils/time';
import { ActionTree } from 'vuex';

import {
  claimSweetAndSour,
  claimUnexpectedMove,
  claimAndExchangeUnexpectedMove,
  exchangeUnexpectedMove,
  claimOlympus,
  DiceType,
  claimDice
} from '@/services/chain';
import { RootStoreState } from '@/store/types';
import { NFTStoreState } from './../types';
import { checkAccountStateIsReady } from '../../account/utils/state';
import { Step } from '@/components/controls/form-loader';
import { claimVaults } from '@/services/chain/nft/vaults/vaults';

export type ClaimPayload = {
  signature: string;
  changeStep: (step: Step) => void;
};

export type ChangePayload = {
  changeStep: (step: Step) => void;
};

export type DicePayload = {
  diceType: DiceType;
  changeStep: (step: Step) => void;
};

export default {
  checkOlympusClaimable({ state }): boolean {
    return (
      lessThan(currentTimestamp(), state.OlympusEndTs) &&
      greaterThan(currentTimestamp(), state.OlympusStartTs)
    );
  },
  async claimOlympus(
    { rootState, state },
    payload: ChangePayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimOlympus(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimVaults(
    { rootState, state },
    payload: ChangePayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimVaults(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimDice({ rootState, state }, payload: DicePayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimDice(
      payload.diceType,
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimSweetAndSour({ rootState }, payload: ClaimPayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimSweetAndSour(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    await claimUnexpectedMove(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice?.price ?? '0',
      payload.changeStep
    );
  },
  async claimAndExchangeUnexpectedMove(
    { rootState },
    payload: ClaimPayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await claimAndExchangeUnexpectedMove(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice.price,
      payload.changeStep
    );
  },
  async exchangeUnexpectedMove(
    { rootState },
    payload: ChangePayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await exchangeUnexpectedMove(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice.price,
      payload.changeStep
    );
  }
} as ActionTree<NFTStoreState, RootStoreState>;
