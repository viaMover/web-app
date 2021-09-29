import axios, { AxiosInstance, AxiosError } from 'axios';
import Web3 from 'web3';
import { clientVersion } from './consts';
import {
  BroadcastMessage,
  CreateProposalParams,
  ErrorResponse,
  GovernanceApiError,
  Scores,
  ScoresResponse,
  Space,
  Strategy,
  VoteParams
} from './types';

export default class Client {
  private readonly voteApiClient: AxiosInstance;
  private readonly scoreApiClient: AxiosInstance;
  constructor(voteApiAddress: string, scoreApiAddress: string) {
    this.voteApiClient = axios.create({
      baseURL: `${voteApiAddress}/api`
    });
    this.scoreApiClient = axios.create({
      baseURL: scoreApiAddress
    });
  }

  public getSpaces = async (): Promise<Array<Space>> => {
    return this.request('spaces');
  };

  public getSpace = async (id: string): Promise<Space> => {
    return this.request(`spaces/${id}`);
  };

  public vote = async (
    web3: Web3,
    accountAddress: string,
    spaceId: string,
    voteParams: VoteParams
  ): Promise<void> => {
    return this.broadcast(web3, accountAddress, spaceId, 'vote', voteParams);
  };

  public createProposal = async (
    web3: Web3,
    accountAddress: string,
    spaceId: string,
    proposalParams: CreateProposalParams
  ): Promise<void> => {
    return this.broadcast(web3, accountAddress, spaceId, 'proposal', {
      type: 'single-choice',
      ...proposalParams
    });
  };

  public getScores = async (
    spaceId: string,
    strategies: Array<Strategy>,
    network: string,
    addresses: Array<string>,
    snapshot: number | string = 'latest'
  ): Promise<Scores> => {
    try {
      const params = {
        space: spaceId,
        network,
        snapshot,
        strategies,
        addresses
      };

      const response = await this.scoreApiClient.post<ScoresResponse>(
        '/scores',
        {
          params
        },
        {
          responseType: 'json',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.result.scores;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response !== undefined) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new GovernanceApiError(
          axiosError.response.data.error_description
        );
      } else if (axiosError.request !== undefined) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest
        console.error(axiosError.request);
        throw new Error(
          `the request is failed, no response: ${axiosError.toJSON()}`
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  };

  private send = async <R>(message: unknown): Promise<R> => {
    return this.request<R>('message', message);
  };

  private broadcast = async (
    web3: Web3,
    accountAddress: string,
    spaceId: string,
    type: string,
    payload: unknown
  ): Promise<void> => {
    const msg: BroadcastMessage = {
      address: accountAddress,
      msg: JSON.stringify({
        version: clientVersion,
        timestamp: (Date.now() / 1e3).toFixed(),
        space: spaceId,
        type,
        payload
      })
    };

    const signature = await web3.eth.personal.sign(msg.msg, accountAddress, '');

    await this.send({
      ...msg,
      sig: signature
    });
  };

  private request = async <R>(command: string, body?: unknown): Promise<R> => {
    try {
      if (body === undefined) {
        const response = await this.voteApiClient.get<R>(`/${command}`);
        return response.data;
      }

      const response = await this.voteApiClient.post<R>(`/${command}`, body, {
        responseType: 'json',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response !== undefined) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new GovernanceApiError(
          axiosError.response.data.error_description
        );
      } else if (axiosError.request !== undefined) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest
        throw new Error(
          `the request is failed, no response: ${axiosError.toJSON()}`
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  };
}
