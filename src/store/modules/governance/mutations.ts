import { ProposalInfo, Space } from '@/services/mover/governance';
import {
  ACTIVE_PROPOSAL_TIME_EXPIRE,
  BLOCK_NUMBER_EXPIRE_TIME,
  CLOSED_PROPOSAL_TIME_EXPIRE,
  COMMUNITY_VOTING_POWER_EXPIRE_TIME,
  SPACE_INFO_EXPIRE_TIME,
  VOTING_POWER_SELF_EXPIRE_TIME
} from '@/store/modules/governance/actions';
import { MutationFuncs } from '@/store/types';

import { GovernanceStoreState } from './types';

type Mutations = {
  setIsLoading: void;
  setIsLoadingMinimal: void;
  clearItems: void;
  upsertItems: void;
  setSpaceInfo: void;
  setPowerNeededToBecomeAProposer: void;
  setCommunityVotingPower: void;
  setVotingPowerSelf: void;
  setBlockNumber: void;
};

const mutations: MutationFuncs<Mutations, GovernanceStoreState> = {
  setIsLoading(state, isLoading: boolean): void {
    state.isLoading = isLoading;
  },
  setIsLoadingMinimal(state, isLoadingMinimal: boolean): void {
    state.isLoadingMinimal = isLoadingMinimal;
  },
  clearItems(state): void {
    state.proposals = new Map();
  },
  upsertItems(state, newItem: ProposalInfo): void {
    const proposals = state.proposals;
    proposals.set(newItem.proposal.id, {
      data: newItem,
      expDate:
        Date.now() +
        (newItem.proposal.state === 'closed'
          ? CLOSED_PROPOSAL_TIME_EXPIRE
          : ACTIVE_PROPOSAL_TIME_EXPIRE)
    });

    state.proposals = new Map(proposals);
  },
  setSpaceInfo(state, info: Space): void {
    state.spaceInfo = {
      data: info,
      expDate: Date.now() + SPACE_INFO_EXPIRE_TIME
    };
  },
  setPowerNeededToBecomeAProposer(state, value: number): void {
    state.powerNeededToBecomeAProposer = value;
  },
  setCommunityVotingPower(state, value: string): void {
    state.communityVotingPower = {
      data: value,
      expDate: Date.now() + COMMUNITY_VOTING_POWER_EXPIRE_TIME
    };
  },
  setVotingPowerSelf(state, value: string): void {
    state.votingPowerSelf = {
      data: value,
      expDate: Date.now() + VOTING_POWER_SELF_EXPIRE_TIME
    };
  },
  setBlockNumber(state, value: number): void {
    state.blockNumberCached = {
      data: value,
      expDate: Date.now() + BLOCK_NUMBER_EXPIRE_TIME
    };
  }
};

export type MutationType = typeof mutations;
export default mutations;
