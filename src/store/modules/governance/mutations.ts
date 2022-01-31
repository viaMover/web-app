import dayjs from 'dayjs';

import { ProposalInfo, Space } from '@/services/mover/governance';
import { MutationFuncs } from '@/store/types';

import { GovernanceStoreState } from './types';

type Mutations = {
  setIsLoading: void;
  setIsLoadingLastProposal: void;
  setError: void;
  setLoadingPromise: void;
  clearItems: void;
  upsertItems: void;
  setSpaceInfo: void;
  setPowerNeededToBecomeAProposer: void;
  setCommunityVotingPower: void;
  setVotingPowerSelf: void;
  setBlockNumberCached: void;
};

const mutations: MutationFuncs<Mutations, GovernanceStoreState> = {
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  setIsLoadingLastProposal(state, isLoadingLastProposal: boolean): void {
    state.isLoadingLastProposal = isLoadingLastProposal;
  },
  setError(state, error: string | Error | undefined): void {
    state.error = error;
  },
  setLoadingPromise(
    state,
    promise: Promise<Array<ProposalInfo>> | undefined
  ): void {
    state.loadingPromise = promise;
  },
  clearItems(state): void {
    state.items = [];
    state.cacheInfoMap = {};
  },
  upsertItems(state, newItem: ProposalInfo): void {
    const existingItemIdx = state.items.findIndex(
      (item) => item.proposal.id === newItem.proposal.id
    );
    if (existingItemIdx < 0) {
      state.items = [...state.items, newItem];
      state.cacheInfoMap[newItem.proposal.id] = {
        updatedAt: dayjs().unix()
      };
      return;
    }

    const newState = state.items.slice();
    newState.splice(existingItemIdx, 1, newItem);
    state.cacheInfoMap[newItem.proposal.id] = { updatedAt: dayjs().unix() };

    state.items = newState;
  },
  setSpaceInfo(state, info: Space): void {
    state.spaceInfo = info;
  },
  setPowerNeededToBecomeAProposer(state, value: number): void {
    state.powerNeededToBecomeAProposer = value;
  },
  setCommunityVotingPower(state, value: string): void {
    state.communityVotingPower = value;
  },
  setVotingPowerSelf(state, value: string): void {
    state.votingPowerSelf = value;
    state.cacheGenericInfoMap['votingPowerSelf'] = {
      updatedAt: dayjs().unix()
    };
  },
  setBlockNumberCached(state, value: number): void {
    state.blockNumberCached = value;
    state.cacheGenericInfoMap['blockNumber'] = {
      updatedAt: dayjs().unix()
    };
  }
};

export type MutationType = typeof mutations;
export default mutations;
