import {
  Choice,
  getDefaultMinimumVotingThresholdMultiplier,
  ProposalInfo,
  Space
} from '@/services/mover/governance';
import { GettersFuncs } from '@/store/types';
import { sameAddress } from '@/utils/address';
import {
  divide,
  greaterThan,
  greaterThanOrEqual,
  multiply
} from '@/utils/bigmath';

import {
  GovernanceStoreState,
  ProposalCumulativeInfo,
  ProposalState
} from './types';

type Getters = {
  isLoading: boolean;
  proposal: (id: string) => ProposalInfo | undefined;
  proposalsIds: Array<string>;
  proposals: Array<ProposalInfo>;
  proposalsOrderedByEndingDesc: Array<ProposalInfo>;
  lastProposal: ProposalInfo | undefined;
  timesVoted: number;
  proposalsCreated: number;
  totalNumberOfProposals: number;
  openProposals: number;
  succeededProposals: number;
  defeatedProposals: number;
  proposalCumulativeInfo: ProposalCumulativeInfo;
  proposalVotedFor: (id: string) => number;
  proposalVotedAgainst: (id: string) => number;
  proposalCommunityVotingPower: (id: string) => string;
  proposalVotingActivity: (id: string) => string;
  proposalState: (id: string) => ProposalState;
  minimumVotingThreshold: string;
  isAlreadyVoted: (id: string) => boolean;
  ipfsLink: (id: string) => string | undefined;
  hasEnoughVotingPowerToVote: (id: string) => boolean;
  hasEnoughVotingPowerToBecomeAProposer: boolean;
  votingPowerSelfOnProposal: (id: string) => string;
  votingPowerSelf: string;
  blockNumberCached: number | undefined;
  communityVotingPower: string;
  spaceInfo: Space | undefined;
};

const getters: GettersFuncs<Getters, GovernanceStoreState> = {
  isLoading(state): boolean {
    return state.isLoading || state.isLoadingMinimal;
  },
  proposal(state): (id: string) => ProposalInfo | undefined {
    return (id) => {
      const prop = state.proposals.get(id);
      if (prop === undefined) {
        return undefined;
      }

      if (prop.expDate > Date.now()) {
        return prop.data;
      }

      return undefined;
    };
  },
  proposalsIds(state): Array<string> {
    return Array.from(state.proposals.values())
      .filter((item) => item.expDate > Date.now()) //remove expired
      .map((item) => item.data.proposal.id);
  },
  proposals(state): Array<ProposalInfo> {
    return Array.from(state.proposals.values())
      .filter((item) => item.expDate > Date.now()) //remove expired
      .map((item) => item.data);
  },
  proposalsOrderedByEndingDesc(state, getters): Array<ProposalInfo> {
    return getters.proposals.sort((a, b) => b.proposal.end - a.proposal.end);
  },
  lastProposal(state, getters): ProposalInfo | undefined {
    return getters.proposalsOrderedByEndingDesc[0] ?? undefined;
  },
  timesVoted(state, getters, rootState): number {
    if (rootState.account?.currentAddress === undefined) {
      return 0;
    }

    return getters.proposals.reduce((count, proposal) => {
      if (
        proposal.votes.some((vote) =>
          sameAddress(vote.voter, rootState.account?.currentAddress)
        )
      ) {
        return count + 1;
      }

      return count;
    }, 0);
  },
  proposalsCreated(state, getters, rootState): number {
    if (rootState.account?.currentAddress === undefined) {
      return 0;
    }

    return getters.proposals.reduce((count, proposal) => {
      if (
        sameAddress(proposal.proposal.author, rootState.account?.currentAddress)
      ) {
        return count + 1;
      }

      return count;
    }, 0);
  },
  totalNumberOfProposals(state, getters): number {
    return getters.proposals.length;
  },
  openProposals(state, getters): number {
    return getters.proposals.reduce((count, proposal) => {
      if (proposal.proposal.state === 'active') {
        return count + 1;
      }

      return count;
    }, 0);
  },
  succeededProposals(state, getters): number {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;
    return getters.proposals.reduce((count, proposal) => {
      const proposalStats = source[proposal.proposal.id];

      if (proposal.proposal.state === 'closed' && proposalStats.isSucceeded) {
        return count + 1;
      }

      return count;
    }, 0);
  },
  defeatedProposals(state, getters): number {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;
    return getters.proposals.reduce((count, proposal) => {
      const proposalStats = source[proposal.proposal.id];

      if (proposal.proposal.state === 'closed' && !proposalStats.isSucceeded) {
        return count + 1;
      }

      return count;
    }, 0);
  },
  proposalCumulativeInfo(state, getters, rootState): ProposalCumulativeInfo {
    return getters.proposals.reduce((acc, item) => {
      let votesCountFor = 0;
      let votesCountAgainst = 0;

      item.scores.all.forEach((score) => {
        item.votes.forEach((vote) => {
          if (vote.choice === Choice.For) {
            votesCountFor = votesCountFor + (score[vote.voter] ?? 0);
          }

          if (vote.choice === Choice.Against) {
            votesCountAgainst = votesCountAgainst + (score[vote.voter] ?? 0);
          }
        });
      });

      const votingPowerSelf = item.scores.self.reduce((acc, score) => {
        return (
          acc +
          (score[rootState.account?.currentAddress ?? 'missing_address'] ?? 0)
        );
      }, 0);

      const votingActivity = divide(
        100 * (votesCountFor + votesCountAgainst),
        item.communityVotingPower
      );
      const isQuorumReached = greaterThan(
        votesCountFor + votesCountAgainst,
        multiply(
          item.communityVotingPower,
          getDefaultMinimumVotingThresholdMultiplier(item.proposal.start)
        )
      );
      const hasOutweight = votesCountFor > votesCountAgainst;
      const isVoted = item.votes.some((vote) =>
        sameAddress(vote.voter, rootState.account?.currentAddress)
      );
      const hasEnoughVotingPowerToVote =
        isVoted || greaterThan(votingPowerSelf, 0);

      return {
        ...acc,
        [item.proposal.id]: {
          state: item.proposal.state,
          communityVotingPower: item.communityVotingPower,
          votesCountFor,
          votesCountAgainst,
          votingActivity,
          isQuorumReached,
          isSucceeded: isQuorumReached && hasOutweight,
          isVoted,
          hasEnoughVotingPowerToVote,
          votingPowerSelf
        }
      };
    }, {});
  },
  proposalVotedFor(state, getters): (id: string) => number {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => source[id]?.votesCountFor ?? 0;
  },
  proposalVotedAgainst(state, getters): (id: string) => number {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => source[id]?.votesCountAgainst ?? 0;
  },
  proposalCommunityVotingPower(state, getters): (id: string) => string {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => source[id]?.communityVotingPower ?? 0;
  },
  proposalVotingActivity(state, getters): (id: string) => string {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => source[id]?.votingActivity ?? 0;
  },
  proposalState(state, getters): (id: string) => ProposalState {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => {
      const item = source[id];
      if (item === undefined) {
        return 'quorumNotReached';
      }

      if (item.state === 'closed') {
        if (item.isSucceeded) {
          return 'accepted';
        } else {
          return 'defeated';
        }
      }

      if (item.isQuorumReached) {
        return 'quorumReached';
      }

      return 'quorumNotReached';
    };
  },
  minimumVotingThreshold(state, getters): string {
    return multiply(
      getters.communityVotingPower,
      state.minimumVotingThresholdMultiplier
    );
  },
  isAlreadyVoted(state, getters): (id: string) => boolean {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => source[id]?.isVoted ?? false;
  },
  ipfsLink(state, getters, rootState): (id: string) => string | undefined {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;
    const accountAddress =
      rootState.account?.currentAddress ?? 'missing_address';

    return (id: string) => {
      if (!source[id]?.isVoted) {
        return undefined;
      }

      return getters
        .proposal(id)
        ?.votes.find((vote) => vote.voter === accountAddress)?.ipfs;
    };
  },
  hasEnoughVotingPowerToVote(state, getters): (id: string) => boolean {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => source[id]?.hasEnoughVotingPowerToVote ?? false;
  },
  hasEnoughVotingPowerToBecomeAProposer(state, getters): boolean {
    return greaterThanOrEqual(
      getters.votingPowerSelf,
      state.powerNeededToBecomeAProposer
    );
  },
  votingPowerSelfOnProposal(state, getters): (id: string) => string {
    const source: ProposalCumulativeInfo = getters.proposalCumulativeInfo;

    return (id: string) => source[id]?.votingPowerSelf ?? '0';
  },
  votingPowerSelf(state): string {
    if (state.votingPowerSelf.expDate > Date.now()) {
      return state.votingPowerSelf.data;
    }

    return '0';
  },
  blockNumberCached(state): number | undefined {
    if (state.blockNumberCached.expDate > Date.now()) {
      return state.blockNumberCached.data;
    }

    return undefined;
  },
  communityVotingPower(state): string {
    if (state.communityVotingPower.expDate > Date.now()) {
      return state.communityVotingPower.data;
    }

    return '0';
  },
  spaceInfo(state): Space | undefined {
    if (state.spaceInfo.expDate > Date.now()) {
      return state.spaceInfo.data;
    }

    return undefined;
  }
};

export type GetterType = typeof getters;
export default getters;
