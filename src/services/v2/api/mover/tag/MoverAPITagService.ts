import axios, { AxiosInstance } from 'axios';
import Web3 from 'web3';

import {
  MoverAPIService,
  MoverAPISuccessfulResponse
} from '@/services/v2/api/mover';
import { Network } from '@/utils/networkTypes';

import { ReserveTagPayload, ReserveTagResponse } from './types';

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

  public async reserveTag(tag: string): Promise<ReserveTagResponse> {
    const sig = await this.web3Client.eth.personal.sign(
      tag,
      this.currentAddress,
      ''
    );

    const payload: ReserveTagPayload = {
      tag: tag,
      address: this.currentAddress,
      signature: sig
    };
    return (
      await this.client.post<MoverAPISuccessfulResponse<ReserveTagResponse>>(
        '/tag',
        payload
      )
    ).data.payload;
  }

  protected lookupBaseURL(): string {
    return 'https://apitag.viamover.com';
  }
}
