import { MutationTree } from 'vuex';

import {
  OlympusData,
  SweetAndSourData,
  UnexpectedMoveData
} from '@/services/chain';
import { DiceData, VaultsData } from '@/services/chain';

import { NFTStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setUnexpectedMoveData(state, data: UnexpectedMoveData): void {
    state.unexpectedMove.meta.totalAmount = data.totalAmount;
    state.unexpectedMove.meta.totalClaimed = data.totalClaimed;
    state.unexpectedMove.meta.totalExchanged = data.totalExchanged;
    state.unexpectedMove.balance = data.balance;
  },
  setSweetAndSourData(state, data: SweetAndSourData): void {
    state.sweetAndSour.meta.totalAmount = data.totalAmount;
    state.sweetAndSour.meta.totalClaimed = data.totalClaimed;
    state.unexpectedMove.balance = data.balance;
  },
  setVaultsData(state, data: VaultsData): void {
    state.vaults.meta.totalAmount = data.totalAmount;
    state.vaults.meta.totalClaimed = data.totalClaimed;
    state.vaults.balance = data.balance;
  },
  setDiceData(state, data: DiceData): void {
    state.dice.meta.totalClaimed = data.totalClaimed;
    state.dice.balance = data.balance;
  },
  setOlympusData(state, data: OlympusData): void {
    state.movingWithOlympus.meta.totalClaimed = data.totalClaimed;
    state.movingWithOlympus.meta.startTs = data.claimStart;
    state.movingWithOlympus.meta.endTs = data.claimEnd;
    state.movingWithOlympus.balance = data.balance;
  }
} as MutationTree<NFTStoreState>;
