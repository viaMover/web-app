export { default as Client } from './client';
export {
  getSpaceList,
  getSpace,
  getProposalIdsList as getProposalsList,
  getProposal,
  createProposal,
  vote,
  getScores,
  getVotingPower,
  getCommunityVotingPower
} from './service';

export { Choice } from './types';

export type {
  Proposal,
  ProposalWithVotes,
  ProposalInfo,
  Space,
  Scores,
  Vote,
  CreateProposalParams,
  VoteParams,
  GovernanceApiError
} from './types';

export {
  minimumVotingThresholdMultiplier,
  defaultProposalDurationDays,
  defaultPowerNeededToBecomeAProposer,
  defaultCachePeriodSeconds,
  moverSpaceId
} from './consts';
