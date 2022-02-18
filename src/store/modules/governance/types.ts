import { Proposal, ProposalInfo, Space } from '@/services/mover/governance';
import { DataStoreWrapper } from '@/store/types';

export type GovernanceStoreState = {
  isLoadingMinimal: boolean;
  isLoading: boolean;

  spaceInfo: DataStoreWrapper<Space | undefined>;
  proposals: Map<string, DataStoreWrapper<ProposalInfo>>;

  communityVotingPower: DataStoreWrapper<string>;
  votingPowerSelf: DataStoreWrapper<string>;
  proposalDurationDays: number;
  powerNeededToBecomeAProposer: number;
  minimumVotingThresholdMultiplier: number;
  spaceId: string;
  blockNumberCached: DataStoreWrapper<number | undefined>;
};

export type ProposalCumulativeInfo = Record<
  string,
  {
    state: 'active' | 'pending' | 'closed' | 'core';
    votesCountFor: number;
    votesCountAgainst: number;
    isSucceeded: boolean;
    isQuorumReached: boolean;
    communityVotingPower: string;
    votingActivity: string;
    isVoted: boolean;
    hasEnoughVotingPowerToVote: boolean;
    votingPowerSelf: string;
  }
>;

export type LoadScoresSelfPayload = {
  proposal: Proposal;
  snapshot?: number | string;
};

export type LoadScoresPayload = {
  addresses: Array<string>;
} & LoadScoresSelfPayload;

export type CreateProposalPayload = {
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
};

export type ProposalState =
  | 'quorumNotReached'
  | 'quorumReached'
  | 'accepted'
  | 'defeated';
