import { MutationTree } from 'vuex';

import {
  OlympusData,
  SweetAndSourData,
  UnexpectedMoveData
} from '@/services/chain';
import { DiceData, VaultsData } from '@/services/chain';

import { NftAssetId, NftAssetWithBalance, NFTStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
  },
  setNFTs(state, data: Array<NftAssetWithBalance>): void {
    state.nfts = data;
  },
  setUnexpectedMoveData(state, data: UnexpectedMoveData): void {
    state.UnexpectedMoveTotalAmount = data.totalAmount;
    state.UnexpectedMoveTotalClaimed = data.totalClaimed;
    state.UnexpectedMoveTotalExchanged = data.totalExchanged;
    state.UnexpectedMoveBalance = data.balance;
    state.nfts = setAssetBalance(state.nfts, 'unexpected-move', data.balance);
  },
  setSweetAndSourData(state, data: SweetAndSourData): void {
    state.SweetAndSourTotalAmount = data.totalAmount;
    state.SweetAndSourTotalClaimed = data.totalClaimed;
    state.nfts = setAssetBalance(state.nfts, 'sweet-and-sour', data.balance);
  },
  setVaultsData(state, data: VaultsData): void {
    state.VaultsTotalAmount = data.totalAmount;
    state.VaultsTotalClaimed = data.totalClaimed;
    state.nfts = setAssetBalance(state.nfts, 'vaults', data.balance);
  },
  setDiceData(state, data: DiceData): void {
    state.DiceTotalClaimed = data.totalClaimed;
    state.nfts = setAssetBalance(state.nfts, 'dice', data.balance);
  },
  setOlympusData(state, data: OlympusData): void {
    state.OlympusTotalClaimed = data.totalClaimed;
    state.OlympusStartTs = data.claimStart;
    state.OlympusEndTs = data.claimEnd;
    state.OlympusBalance = data.balance;
    state.nfts = setAssetBalance(state.nfts, 'olympus', data.balance);
  }
} as MutationTree<NFTStoreState>;

const setAssetBalance = (
  assets: Array<NftAssetWithBalance>,
  id: NftAssetId,
  balance: string
): Array<NftAssetWithBalance> => {
  const assetIndex = assets.findIndex((asset) => asset.id === id);
  if (assetIndex < 0) {
    return assets;
  }

  const slice = assets.slice();
  slice[assetIndex] = { ...slice[assetIndex], balance };

  return slice;
};
