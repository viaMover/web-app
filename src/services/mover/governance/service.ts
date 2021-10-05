import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { voteHubBaseUrl, graphqlUrl, scoresApiBaseUrl } from './consts';
import {
  PROPOSALS_QUERY,
  PROPOSAL_VOTES_QUERY,
  LAST_PROPOSAL_QUERY
} from './queries';
import Client from './client';
import { ProposalsResponse, ProposalWithVotes } from './types';

const snapshotClient = new Client(voteHubBaseUrl, scoresApiBaseUrl);
const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: graphqlUrl
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache'
    }
  }
});

export const getProposalIdsList = async (
  spaceId: string
): Promise<Array<string>> => {
  const result = await graphqlClient.query<ProposalsResponse>({
    query: PROPOSALS_QUERY,
    variables: {
      space: spaceId
    }
  });

  if (result.data?.proposals === undefined || result.data.proposals === null) {
    return [];
  }

  return result.data.proposals.map((item) => item.id);
};

export const getLastProposalId = async (): Promise<string | undefined> => {
  const result = await graphqlClient.query<ProposalsResponse>({
    query: LAST_PROPOSAL_QUERY
  });

  if (result.data?.proposals === undefined || result.data.proposals === null) {
    return undefined;
  }

  return result.data.proposals[0]?.id ?? undefined;
};

export const getProposal = async (id: string): Promise<ProposalWithVotes> => {
  const result = graphqlClient.query<ProposalWithVotes>({
    query: PROPOSAL_VOTES_QUERY,
    variables: {
      id
    }
  });

  return (await result).data;
};

export const getCommunityVotingPower = async (
  snapshot?: number
): Promise<number> => {
  return getVotingPower('all', snapshot);
};

export const getVotingPower = async (
  address: string,
  snapshot?: number
): Promise<number> => {
  console.log('TODO: just to use snapshot parameter', snapshot);
  return Promise.resolve(123456);
};

export const getSpaceList = snapshotClient.getSpaces;

export const getSpace = snapshotClient.getSpace;

export const vote = snapshotClient.vote;

export const createProposal = snapshotClient.createProposal;

export const getScores = snapshotClient.getScores;
