import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import Web3 from 'web3';

import { MoverError } from '@/services/v2';
import {
  MoverAPIError,
  MoverAPIService,
  MoverAPISuccessfulResponse
} from '@/services/v2/api/mover';
import { Network } from '@/utils/networkTypes';

import {
  Choice,
  CreateProposalParams,
  CreateProposalPayload,
  CreateProposalResponse,
  CurrentVotingInfo,
  ErrorCode,
  GetProposalOrListOptions,
  GetProposalOrListRequestParams,
  ProposalInfo,
  ProposalInfoAPIDto,
  SignedRequestPayload,
  VotePayload,
  VoteResponse
} from './types';

export class MoverAPIGovernanceService extends MoverAPIService {
  protected baseURL: string;
  protected web3Client: Web3 | undefined;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'governance.api.service';
  protected static readonly defaultAddress = 'view_only';

  constructor(
    currentAddress = MoverAPIGovernanceService.defaultAddress,
    web3Client?: Web3
  ) {
    super(currentAddress, Network.mainnet);
    this.web3Client = web3Client;

    this.baseURL = this.lookupBaseURL();
    this.client = this.applyAxiosInterceptors(
      axios.create({
        baseURL: this.baseURL,
        headers: {
          Accept: 'application/json'
        },
        paramsSerializer: this.getParamsSerializer
      })
    );
  }

  public async getProposalList(
    opts?: GetProposalOrListOptions
  ): Promise<Array<ProposalInfo>> {
    const data = (
      await this.client.get<MoverAPISuccessfulResponse<Array<ProposalInfo>>>(
        '/proposals',
        {
          params: this.mapGetProposalOrListOptionsToRequestParams(opts)
        }
      )
    ).data.payload;

    return data.map(this.mapProposalInfoAPIDto);
  }

  public async getLastProposal(
    opts?: GetProposalOrListOptions
  ): Promise<ProposalInfo> {
    const data = (
      await this.client.get<MoverAPISuccessfulResponse<ProposalInfo>>(
        '/proposals/last',
        {
          params: this.mapGetProposalOrListOptionsToRequestParams(opts)
        }
      )
    ).data.payload;

    return this.mapProposalInfoAPIDto(data);
  }

  public async getProposalById(
    id: string,
    opts?: GetProposalOrListOptions
  ): Promise<ProposalInfo | undefined> {
    try {
      const data = (
        await this.client.get<MoverAPISuccessfulResponse<ProposalInfo>>(
          `/proposals/${id}`,
          {
            params: this.mapGetProposalOrListOptionsToRequestParams(opts)
          }
        )
      ).data.payload;

      return this.mapProposalInfoAPIDto(data);
    } catch (error) {
      if (error instanceof MoverAPIError) {
        if (error.shortMessage === ErrorCode.ProposalNotFound) {
          return undefined;
        }
      }

      throw error;
    }
  }

  public async getCurrentVotingInfo(): Promise<CurrentVotingInfo> {
    return (
      await this.client.get<MoverAPISuccessfulResponse<CurrentVotingInfo>>(
        `/voting-info`,
        {
          params: {
            voter_address:
              this.currentAddress === MoverAPIGovernanceService.defaultAddress
                ? undefined
                : this.currentAddress
          }
        }
      )
    ).data.payload;
  }

  public async createProposal(
    template: CreateProposalParams
  ): Promise<CreateProposalResponse> {
    let blockNumber = template.blockNumber;
    if (blockNumber === undefined) {
      if (this.web3Client === undefined) {
        throw new MoverError(
          'Web3 client is required when template is missing blockNumber'
        );
      }

      try {
        blockNumber = await this.web3Client.eth.getBlockNumber();
      } catch (error) {
        throw new MoverError('Failed to get block number').wrap(error);
      }
    }

    const data: CreateProposalPayload['data'] = {
      name: template.name,
      body: template.body,
      start: dayjs().unix(),
      snapshot: blockNumber
    };

    return (
      await this.client.post<
        MoverAPISuccessfulResponse<CreateProposalResponse>
      >('/proposals/create', {
        body: this.prepareSignedRequest(data)
      })
    ).data.payload;
  }

  public async vote(proposalId: string, choice: Choice): Promise<VoteResponse> {
    const data: VotePayload['data'] = {
      proposalId: proposalId,
      choice: choice
    };

    return (
      await this.client.post<
        MoverAPISuccessfulResponse<CreateProposalResponse>
      >(`/proposals/${proposalId}/vote`, {
        body: this.prepareSignedRequest(data)
      })
    ).data.payload;
  }

  protected lookupBaseURL(): string {
    return (
      process.env.VUE_APP_GOVERNANCE_API_BASE_URL ??
      'https://apivote.viamover.com/api/v1'
    );
  }

  protected async prepareSignedRequest<T>(
    data: T
  ): Promise<SignedRequestPayload<T>> {
    if (this.web3Client === undefined) {
      throw new MoverError('Web3 client is required for signed requests');
    }

    if (this.currentAddress === MoverAPIGovernanceService.defaultAddress) {
      throw new MoverError('Real address is required for signed requests');
    }

    const now = dayjs().unix();

    const messageToSign = JSON.stringify({
      address: this.currentAddress,
      ...data,
      timestamp: now
    });

    let signature;
    try {
      signature = await this.web3Client.eth.personal.sign(
        messageToSign,
        this.currentAddress,
        ''
      );
    } catch (error) {
      throw new MoverError('Failed to sign request').wrap(error);
    }

    return {
      data: data,
      meta: {
        signature: signature,
        message: messageToSign,
        address: this.currentAddress,
        timestamp: now
      }
    };
  }

  protected mapGetProposalOrListOptionsToRequestParams(
    opts?: GetProposalOrListOptions
  ): GetProposalOrListRequestParams {
    return {
      voter_address: opts?.useAddress ?? true ? this.currentAddress : undefined,
      load_votes: opts?.includeVotes ?? false
    };
  }

  protected mapProposalInfoAPIDto(data: ProposalInfoAPIDto): ProposalInfo {
    return {
      proposal: data.proposal,
      votes: data.votes ?? [],
      stats: data.stats,
      voteInfo: data.voteInfo
        ? {
            voted: data.voteInfo.voted,
            votingPower: data.voteInfo.votingPower ?? 0,
            ipfsHash: data.voteInfo.ipfsHash
          }
        : {
            voted: false,
            votingPower: 0,
            ipfsHash: undefined
          }
    };
  }
}
