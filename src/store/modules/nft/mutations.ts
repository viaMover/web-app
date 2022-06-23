import {
  BaseledgerStakingOGData,
  DiceData,
  OlympusData,
  OrderOfLibertyData,
  SweetAndSourData,
  UnexpectedMoveData,
  VaultsData
} from '@/services/chain';
import { ENSAPIService, ERC721Meta as ENSData } from '@/services/v2/api/ens';
import { ERC721Meta as UNSData, UNSAPIService } from '@/services/v2/api/uns';
import { ENSOnChainService } from '@/services/v2/on-chain/ens';
import { UNSOnChainService } from '@/services/v2/on-chain/uns';
import { MutationFuncs } from '@/store/types';

import { NFTStoreState } from './types';

type Mutations = {
  setIsLoading: void;
  setUnexpectedMoveData: void;
  setSweetAndSourData: void;
  setVaultsData: void;
  setDiceData: void;
  setOlympusData: void;
  setOrderOfLibertyData: void;
  setBaseledgerStakingOGData: void;
  setENSOnChainService: void;
  setENSAPIService: void;
  setENSData: void;
  setUNSAPIService: void;
  setUNSOnChainService: void;
  setUNSData: void;
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
  setBaseledgerStakingOGData(state, data: BaseledgerStakingOGData): void {
    state.baseledgerStakingOG.meta.totalSupply = data.totalSupply;
    state.baseledgerStakingOG.balance = data.balance;
  },
  setOlympusData(state, data: OlympusData): void {
    state.movingWithOlympus.meta.totalClaimed = data.totalClaimed;
    state.movingWithOlympus.meta.startTs = data.claimStart;
    state.movingWithOlympus.meta.endTs = data.claimEnd;
    state.movingWithOlympus.balance = data.balance;
  },
  setOrderOfLibertyData(state, data: OrderOfLibertyData): void {
    state.orderOfLiberty.balance = data.balance;
    state.orderOfLiberty.meta.totalSupply = data.totalSupply;
    state.orderOfLiberty.meta.defaultPrice = data.defaultPrice;
    state.orderOfLiberty.meta.availablePrices = data.availablePrices;
  },
  setENSAPIService(state, service: ENSAPIService): void {
    state.ensAPIService = service;
  },
  setENSOnChainService(state, service: ENSOnChainService): void {
    state.ensOnChainService = service;
  },
  setENSData(state, data: ENSData): void {
    state.ens.balance = '1';
    state.ens.name = data.name;
    state.ens.meta.description = data.description;
    state.ens.bigPicture = {
      src: data.image_url ?? data.background_image
    };
    state.ens.picture = {
      src: data.image_url ?? data.background_image
    };
    state.ens.meta.attributes = data.attributes;
    state.ens.meta.url = data.url;
  },
  setUNSAPIService(state, service: UNSAPIService): void {
    state.unsAPIService = service;
  },
  setUNSOnChainService(state, service: UNSOnChainService): void {
    state.unsOnChainService = service;
  },
  setUNSData(state, data: UNSData): void {
    state.uns.balance = '1';
    state.uns.name = data.name;
    state.uns.bigPicture = {
      src: data.image ?? data.image_url
    };
    state.uns.picture = {
      src: data.image ?? data.image_url
    };
    state.uns.meta.attributes = data.attributes;
    state.uns.meta.description = data.description;
    state.uns.meta.backgroundColor = data.background_color;
    state.uns.meta.externalUrl = data.external_url;
  }
};

export type MutationType = typeof mutations;
export default mutations;
