import axios, { AxiosError, AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import Web3 from 'web3';

import { defaultClientVersion } from './consts';
import {
  BroadcastMessage,
  CreateProposalParams,
  CreateProposalResponse,
  ErrorResponse,
  GovernanceApiError,
  Scores,
  ScoresResponse,
  ServerInfo,
  Space,
  Strategy,
  VoteParams,
  VoteResponse
} from './types';

export default class Client {
  private readonly voteApiClient: AxiosInstance;
  private readonly scoreApiClient: AxiosInstance;
  private clientVersion: string;
  private isInitialized: boolean;

  constructor(voteApiAddress: string, scoreApiAddress: string) {
    this.voteApiClient = axios.create({
      baseURL: `${voteApiAddress}/api`
    });

    this.scoreApiClient = axios.create({
      baseURL: scoreApiAddress
    });

    this.isInitialized = false;
    this.clientVersion = defaultClientVersion;
  }

  public initialize = async (): Promise<void> => {
    try {
      const serverInfo = await this.getServerInfo();

      this.clientVersion = serverInfo.version;
      this.isInitialized = true;
    } catch (error) {
      this.clientVersion = defaultClientVersion;
    }
  };

  private getServerInfo = async (): Promise<ServerInfo> => {
    return this.request<ServerInfo>('');
  };

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
  ): Promise<VoteResponse> => {
    return this.broadcast<VoteResponse>(
      web3,
      accountAddress,
      spaceId,
      'vote',
      voteParams
    );
  };

  public createProposal = async (
    web3: Web3,
    accountAddress: string,
    spaceId: string,
    proposalParams: CreateProposalParams
  ): Promise<CreateProposalResponse> => {
    return this.broadcast<CreateProposalResponse>(
      web3,
      accountAddress,
      spaceId,
      'proposal',
      {
        type: 'single-choice',
        ...proposalParams
      }
    );
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
        throw new Error(`the request is failed, no response: ${axiosError}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  };

  private send = async <R>(message: unknown): Promise<R> => {
    return this.request<R>('message', message);
  };

  private broadcast = async <T>(
    web3: Web3,
    accountAddress: string,
    spaceId: string,
    type: string,
    payload: unknown
  ): Promise<T> => {
    if (!this.isInitialized) {
      // the server implicitly requires all the broadcast messages
      // to be signed with proper client version
      // so we have to be sure that this version is used
      //
      // since our vote hub is not going to be updated
      // package-wise very frequently, we can make an assumption
      // that we satisfy server version in every case
      await this.initialize();
    }

    const msg: BroadcastMessage = {
      address: accountAddress,
      msg: JSON.stringify({
        version: this.clientVersion,
        timestamp: dayjs().unix().toFixed(),
        space: spaceId,
        type,
        payload
      })
    };

    const signature = await web3.eth.personal.sign(msg.msg, accountAddress, '');

    return await this.send<T>({
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
        throw new Error(`the request is failed, no response: ${axiosError}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  };
}
