import { MutationTree } from 'vuex';
import dayjs from 'dayjs';

import { ProposalInfo, Space } from '@/services/mover/governance';

import { ProposalStoreState } from './types';

export default {
  setIsLoading(state, isLoading): void {
    state.isLoading = isLoading;
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
  setCommunityVotingPower(state, value: number): void {
    state.communityVotingPower = value;
  },
  setVotingPowerSelf(state, value: number): void {
    state.votingPowerSelf = value;
  }
} as MutationTree<ProposalStoreState>;
