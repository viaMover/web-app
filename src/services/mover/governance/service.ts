import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import axios, { AxiosError } from 'axios';

import { Result } from '@/services/responses';

import { baseUrl as moverApiBaseUrl } from '../consts';
import { ErrorResponse as MoverApiErrorResponse } from '../responses';
import Client from './client';
import { graphqlUrl, scoresApiBaseUrl, voteHubBaseUrl } from './consts';
import {
  LAST_PROPOSAL_QUERY,
  PROPOSAL_VOTES_QUERY,
  PROPOSALS_QUERY
} from './queries';
import {
  GovernanceApiError,
  ProposalsResponse,
  ProposalWithVotes,
  VotingPowerInfo,
  VotingPowerInfoResponse
} from './types';

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
const moverApiClient = axios.create({
  baseURL: moverApiBaseUrl,
  headers: {
    Accept: 'application/json'
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

export const getSpaceList = snapshotClient.getSpaces;

export const getSpace = snapshotClient.getSpace;

export const vote = snapshotClient.vote;

export const createProposal = snapshotClient.createProposal;

export const getScores = snapshotClient.getScores;

export const getCommunityVotingPower = async (
  snapshot: number
): Promise<Result<VotingPowerInfo, string>> => {
  try {
    const response = (
      await moverApiClient.post<VotingPowerInfoResponse>(
        '/v1/voting/communityPower',
        {
          blockNumber: snapshot
        },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      )
    ).data;
    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.error
      };
    }

    return { isError: false, result: response.payload };
  } catch (error) {
    const axiosError = error as AxiosError<MoverApiErrorResponse<unknown>>;
    if (axiosError.response !== undefined) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new GovernanceApiError(axiosError.response.data.error);
    } else if (axiosError.request !== undefined) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest
      throw new Error(`the request is failed, no response: ${axiosError}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

export const getVotingPower = async (
  address: string,
  snapshot: number
): Promise<Result<VotingPowerInfo, string>> => {
  try {
    const response = (
      await moverApiClient.post<VotingPowerInfoResponse>(
        '/v1/voting/addressPower',
        {
          address,
          blockNumber: snapshot
        },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      )
    ).data;
    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.error
      };
    }

    return { isError: false, result: response.payload };
  } catch (error) {
    const axiosError = error as AxiosError<MoverApiErrorResponse<unknown>>;
    if (axiosError.response !== undefined) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new GovernanceApiError(axiosError.response.data.error);
    } else if (axiosError.request !== undefined) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest
      throw new Error(`the request is failed, no response: ${axiosError}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};
