import { Proposal, ProposalInfo, Space } from '@/services/mover/governance';

export type GovernanceStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;
  loadingPromise: Promise<Array<ProposalInfo>> | undefined;
  spaceInfo: Space | undefined;
  items: Array<ProposalInfo>;
  cacheInfoMap: Record<string, CacheInfo>;
  cacheGenericInfoMap: Record<string, CacheInfo>;
  communityVotingPower: string;
  votingPowerSelf: string;
  proposalDurationDays: number;
  powerNeededToBecomeAProposer: number;
  minimumVotingThresholdMultiplier: number;
  spaceId: string;
  cachePeriodSeconds: number;
  isLoadingLastProposal: boolean;
  blockNumberCached: number | undefined;
};

export interface CacheInfo {
  updatedAt: number;
}

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

export type LoadProposalInfoPayload = {
  id: string;
  refetch: boolean;
};

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
