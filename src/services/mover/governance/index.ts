export { default as Client } from './client';
export {
  getSpaceList,
  getSpace,
  getProposalIdsList,
  getLastProposalId,
  getProposal,
  createProposal,
  vote,
  getScores,
  getVotingPower,
  getCommunityVotingPower
} from './service';

export { Choice, GovernanceApiError } from './types';

export type {
  Proposal,
  ProposalWithVotes,
  ProposalInfo,
  Space,
  Scores,
  Vote,
  CreateProposalParams,
  CreateProposalResponse,
  VoteParams,
  VoteResponse
} from './types';

export {
  getDefaultMinimumVotingThresholdMultiplier,
  defaultProposalDurationDays,
  getDefaultPowerNeededToBecomeAProposer,
  defaultCachePeriodSeconds,
  moverSpaceId
} from './consts';
