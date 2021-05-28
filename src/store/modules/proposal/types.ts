export type Proposal = {
  id: string;
  name: string;
  status: Status;
  text: string;
  proposer: string;
  ends: number;
  // in percent form.
  // example: 25 means 25%
  votingActivity: number;
  votesFor: number;
  votesAgainst: number;
  currentOutcome: Outcome;
};

type Status = 'open' | 'ended';
type Outcome = 'quorumNotReached' | 'quorumReached' | 'accepted' | 'defeated';

export type ProposalStoreState = {
  isLoading: boolean;
  loadingPromise: Promise<Array<Proposal>> | null;
  proposals: Array<Proposal>;
};
