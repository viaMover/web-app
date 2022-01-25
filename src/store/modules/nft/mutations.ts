import {
  DiceData,
  OlympusData,
  SweetAndSourData,
  UnexpectedMoveData,
  VaultsData
} from '@/services/chain';
import { MutationFuncs } from '@/store/types';

import { NftAsset, NFTStoreState } from './types';

enum Mutations {
  setIsLoading,
  setNFTs,
  setUnexpectedMoveData,
  setSweetAndSourData,
  setVaultsData,
  setDiceData,
  setOlympusData
}

const mutations: MutationFuncs<typeof Mutations, NFTStoreState> = {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setNFTs(state, data: Array<NftAsset>): void {
    state.nfts = data;
  },
  setUnexpectedMoveData(state, data: UnexpectedMoveData): void {
    state.UnexpectedMoveTotalAmount = data.totalAmount;
    state.UnexpectedMoveTotalClaimed = data.totalClaimed;
    state.UnexpectedMoveTotalExchanged = data.totalExchanged;
    state.UnexpectedMoveBalance = data.balance;
  },
  setSweetAndSourData(state, data: SweetAndSourData): void {
    state.SweetAndSourTotalAmount = data.totalAmount;
    state.SweetAndSourTotalClaimed = data.totalClaimed;
  },
  setVaultsData(state, data: VaultsData): void {
    state.VaultsTotalAmount = data.totalAmount;
    state.VaultsTotalClaimed = data.totalClaimed;
  },
  setDiceData(state, data: DiceData): void {
    state.DiceTotalClaimed = data.totalClaimed;
  },
  setOlympusData(state, data: OlympusData): void {
    state.OlympusTotalClaimed = data.totalClaimed;
    state.OlympusStartTs = data.claimStart;
    state.OlympusEndTs = data.claimEnd;
    state.OlympusBalance = data.balance;
  }
};

export type MutationType = typeof mutations;
export default mutations;
