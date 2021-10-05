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
  VoteParams
} from './types';

export {
  minimumVotingThresholdMultiplier,
  defaultProposalDurationDays,
  defaultPowerNeededToBecomeAProposer,
  defaultCachePeriodSeconds,
  moverSpaceId
} from './consts';
