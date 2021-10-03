import { Proposal, ProposalInfo, Space } from '@/services/mover/governance';

export type GovernanceStoreState = {
  isLoading: boolean;
  error: string | Error | undefined;
  loadingPromise: Promise<Array<ProposalInfo>> | undefined;
  spaceInfo: Space | undefined;
  items: Array<ProposalInfo>;
  cacheInfoMap: Record<string, CacheInfo>;
  cacheGenericInfoMap: Record<string, CacheInfo>;
  communityVotingPower: number;
  votingPowerSelf: number;
  proposalDurationDays: number;
  powerNeededToBecomeAProposer: number;
  minimumVotingThresholdMultiplier: number;
  spaceId: string;
  cachePeriodSeconds: number;
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
    isSucceded: boolean;
    isQuorumReached: boolean;
    communityVotingPower: number;
    votingActivity: number;
    isVoted: boolean;
    hasEnoughVotingPowerToVote: boolean;
  }
>;

export type LoadProposalInfoPayload = {
  id: string;
  refetch: boolean;
};

export type LoadScoresPayload = {
  proposal: Proposal;
  addresses: Array<string>;
  snapshot?: number | string;
};

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
