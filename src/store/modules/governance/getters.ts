import {
  ProposalInfo,
  ProposalState,
  ProposalStatus
} from '@/services/v2/api/mover/governance';
import { GettersFuncs } from '@/store/types';

import { GovernanceStoreState } from './types';

type Getters = {
  proposalsOrderedByEndingDesc: Array<ProposalInfo>;
  lastProposalInfo: ProposalInfo | undefined;
  timesVoted: number;
  proposalsCreated: number;
  totalNumberOfProposals: number;
  openProposals: number;
  succeededProposals: number;
  defeatedProposals: number;
  hasEnoughVotingPowerToBecomeAProposer: boolean;
};

const getters: GettersFuncs<Getters, GovernanceStoreState> = {
  proposalsOrderedByEndingDesc(state): Array<ProposalInfo> {
    return state.proposalInfoList.sort(
      (a, b) => b.proposal.endTs - a.proposal.endTs
    );
  },
  lastProposalInfo(state, getters): ProposalInfo | undefined {
    return getters.proposalsOrderedByEndingDesc[0] ?? undefined;
  },
  timesVoted(state): number {
    return state.proposalInfoList.reduce((acc, item) => {
      if (item.voteInfo.voted) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
  },
  proposalsCreated(state, getters, rootState): number {
    const currentAddress = rootState.account?.currentAddress;
    return state.proposalInfoList.reduce((acc, item) => {
      if (item.proposal.author === currentAddress) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
  },
  totalNumberOfProposals(state): number {
    return state.proposalInfoList.length;
  },
  openProposals(state): number {
    return state.proposalInfoList.reduce((acc, item) => {
      if (
        item.proposal.state === ProposalState.Active ||
        item.proposal.state === ProposalState.Pending
      ) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
  },
  succeededProposals(state): number {
    return state.proposalInfoList.reduce((acc, item) => {
      if (item.proposal.status === ProposalStatus.Passed) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
  },
  defeatedProposals(state): number {
    return state.proposalInfoList.reduce((acc, item) => {
      if (item.proposal.status === ProposalStatus.Rejected) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
  },
  hasEnoughVotingPowerToBecomeAProposer(state): boolean {
    return (
      state.currentVotingInfo.votingPower >
      state.currentVotingInfo.minimalVotingPower
    );
  }
};

export type GetterType = typeof getters;
export default getters;
