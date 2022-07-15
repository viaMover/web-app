import axios, { AxiosInstance } from 'axios';
import Web3 from 'web3';

import {
  MoverAPIService,
  MoverAPISuccessfulResponse
} from '@/services/v2/api/mover';
import { isProduction } from '@/settings';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';

import {
  LookupTagResponse,
  ReserveTagPayload,
  ReserveTagResponse
} from './types';

export class MoverAPITagService extends MoverAPIService {
  protected baseURL: string;
  protected readonly sentryCategoryPrefix = 'tag.api.service';
  protected readonly client: AxiosInstance;
  protected readonly web3Client: Web3;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL();
    this.client = this.applyAxiosInterceptors(
      axios.create({
        baseURL: this.baseURL
      })
    );
    this.web3Client = web3Client;
  }

  public async reserveTag(
    tag: string,
    partner: string | undefined
  ): Promise<ReserveTagResponse> {
    const dataToSign = {
      name: tag,
      address: this.currentAddress,
      timestamp: currentTimestamp()
    };

    const signature = await this.web3Client.eth.personal.sign(
      JSON.stringify(dataToSign),
      this.currentAddress,
      ''
    );

    const payload: ReserveTagPayload = {
      data: dataToSign,
      meta: {
        address: this.currentAddress,
        sig: signature,
        partner: partner
      }
    };
    return (
      await this.client.post<MoverAPISuccessfulResponse<ReserveTagResponse>>(
        '/tag',
        payload
      )
    ).data.payload;
  }

  public async lookupTag(): Promise<LookupTagResponse> {
    return (
      await this.client.get<MoverAPISuccessfulResponse<LookupTagResponse>>(
        `/tag/${this.currentAddress}`
      )
    ).data.payload;
  }

  protected lookupBaseURL(): string {
    return isProduction()
      ? 'https://apitag.viamover.com'
      : 'https://apitagstg.viamover.com';
  }
}
