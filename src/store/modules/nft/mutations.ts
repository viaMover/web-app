import {
  DiceData,
  OlympusData,
  SweetAndSourData,
  UnexpectedMoveData,
  VaultsData
} from '@/services/chain';
import { MutationFuncs } from '@/store/types';

import { NFTStoreState } from './types';

type Mutations = {
  setIsLoading: void;
  setNFTs: void;
  setUnexpectedMoveData: void;
  setSweetAndSourData: void;
  setVaultsData: void;
  setDiceData: void;
  setOlympusData: void;
};

const mutations: MutationFuncs<Mutations, NFTStoreState> = {
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
};

export type MutationType = typeof mutations;
export default mutations;
