export type Strategy = {
  name: string;
  params: unknown;
};

export type Filters = {
  minScore: number;
  defaultTab: string;
  onlyMembers: boolean;
};

export type Space = {
  _activeProposals: never;
  about: string;
  admins: Array<string>;
  domain: string;
  filters: Filters;
  github: string;
  id: string;
  members: Array<string>;
  name: string;
  network: never;
  plugins: never;
  private: boolean;
  skin: string;
  strategies: Array<Strategy>;
  symbol: string;
  twitter: string;
};

export type Proposal = {
  id: string;
  title: string;
  body: string;
  choices: Array<string>;
  start: number;
  end: number;
  snapshot: string;
  state: 'active' | 'pending' | 'closed' | 'core';
  author: string;
  network: string;
  created: number;
  type: string;
  strategies: Array<Strategy>;
};

export type ProposalsResponse = {
  proposals: Array<{ id: string }>;
};

export type Vote = {
  id: string;
  ipfs: string;
  voter: string;
  created: number;
  choice: unknown;
};

export type ProposalWithVotes = {
  proposal: Proposal;
  votes: Array<Vote>;
};

export type ProposalInfo = ProposalWithVotes & {
  scores: {
    all: Scores;
    self: Scores;
  };
  communityVotingPower: number;
};

export interface VoteParams {
  proposal: string;
  choice: number;
  metadata?: Record<string, unknown>;
}

export interface CreateProposalParams {
  name: string;
  body: string;
  choices: Array<string>;
  start: number;
  end: number;
  snapshot: number;
  metadata?: Record<string, unknown>;
}

export type BroadcastMessage = {
  address: string;
  msg: string;
};

export enum Choice {
  For = 1,
  Against = 2
}

export type Scores = Array<{
  [address: string]: number;
}>;

export type ScoresResponse = {
  result: {
    state: string;
    scores: Scores;
  };
};

export type ErrorResponse = {
  error: string;
  error_description: string;
};

export class GovernanceApiError extends Error {
  constructor(readonly message: string) {
    super();
  }
}
