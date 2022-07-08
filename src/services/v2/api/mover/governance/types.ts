export enum Choice {
  For = 'for',
  Against = 'against'
}

export enum ProposalState {
  Active = 'active',
  Pending = 'pending',
  Closed = 'closed'
}

export enum ProposalStatus {
  Passed = 'passed',
  Rejected = 'rejected',
  QuorumReached = 'quorum reached',
  QuorumNotReached = 'quorum not reached'
}

export enum ErrorCode {
  AccountBanned = 'ACCOUNT_IS_BANNED',
  BadRequest = 'BAD_REQUEST',
  InvalidAddress = 'INVALID_ADDRESS_ERROR',
  ProposalNotFound = 'NOT_FOUND_ERROR',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  InvalidPayloadOrSignature = 'INCORRECT_SIGN_ERROR',
  SignedMessageMismatch = 'MESSAGE_MATCH_DATA_ERROR',
  InsufficientVotingPower = 'NOT_ENOUGH_VP_ERROR'
}

export type SignedRequestPayload<T> = {
  data: T;
  meta: {
    address: string;
    signature: string;
    message: string;
    timestamp: number;
  };
};

export type CreateProposalParams = {
  name: string;
  body: string;
  blockNumber?: number;
};

export type CreateProposalPayload = SignedRequestPayload<{
  name: string;
  body: string;
  start: number;
  snapshot: number;
}>;

export type CreateProposalResponse = {
  id: string;
  ipfs: string; // ipfs hash to the proposal
};

export type VotePayload = SignedRequestPayload<{
  choice: Choice;
  proposalId: string;
}>;

export type VoteResponse = {
  id: string;
  ipfs: string; // ipfs hash to the vote
};

export type ProposalInfo = {
  proposal: Proposal;
  votes: Array<Vote>;
  voted: boolean;
  // if .voted -> vote ipfs hash
  ipfsHash?: string;
  stats: {
    for: number;
    against: number;
  };
};

export type Proposal = {
  id: string;
  ipfs: string;
  author: string;
  createdTs: number;
  title: string;
  body: string;
  startTs: number;
  endTs: number;
  snapshot: number;
  state: ProposalState;
  status: ProposalStatus;
  votingActivity: number;
  communityVotingPower: number;
  minimalVotingPower: number;
};

export type Vote = {
  id: string;
  ipfs: string;
  voter: string;
  createdTs: number;
  choice: Choice;
  votingPower: number;
};

export interface GetProposalOrListOptions {
  useAddress?: boolean;
  includeVotes?: boolean;
}

export interface GetProposalOrListRequestParams {
  voter_address?: string;
  load_votes: boolean;
}

export type CurrentVotingInfo = {
  votingPower: number;
  communityVotingPower: number;
  minimalVotingPower: number; // to create a proposal
};