/* eslint-disable  @typescript-eslint/no-non-null-assertion */

import { greaterThan, lessThan } from '@/utils/bigmath';
import { currentTimestamp } from '@/utils/time';
import { ActionTree } from 'vuex';

import {
  claimSweetAndSour,
  claimUnexpectedMove,
  claimAndExchangeUnexpectedMove,
  exchangeUnexpectedMove,
  claimOlympus
} from '@/services/chain';
import { RootStoreState } from '@/store/types';
import { NFTStoreState } from './../types';
import { checkAccountStateIsReady } from '../../account/utils/state';
import { Step } from '@/components/controls/form-loader';

export type ClaimPayload = {
  signature: string;
  changeStep: (step: Step) => Promise<void>;
};

export type ChangePayload = {
  changeStep: (step: Step) => Promise<void>;
};

export default {
  async claimOlympus(
    { rootState, state },
    payload: ChangePayload
  ): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    if (
      greaterThan(currentTimestamp(), state.OlympusEndTs) ||
      lessThan(currentTimestamp(), state.OlympusStartTs)
    ) {
      throw new Error('Public claim has not started yet!');
    }

    await claimOlympus(
      rootState!.account!.currentAddress!,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice.price,
      payload.changeStep
    );
  },
  async claimSweetAndSour({ rootState }, payload: ClaimPayload): Promise<void> {
    if (!checkAccountStateIsReady(rootState)) {
      throw new Error('Account state is not loaded, please, try again');
    }

    const fastGasPrice = rootState.account!.gasPrices?.FastGas;

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await claimSweetAndSour(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice.price,
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

    if (fastGasPrice === undefined) {
      throw new Error('There is no gas price, please, try again');
    }

    await claimUnexpectedMove(
      rootState!.account!.currentAddress!,
      payload.signature,
      rootState!.account!.networkInfo!.network,
      rootState!.account!.provider!.web3,
      fastGasPrice.price,
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
