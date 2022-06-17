import axios, { AxiosInstance } from 'axios';

import { DomainInformation, ERC721Meta } from '@/services/v2/api/uns/types';

export class UNSAPIService {
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'unstoppable-domains.api.service';

  constructor() {
    this.client = axios.create({
      headers: {
        Accept: 'application/json'
      }
    });
  }

  public async getDomainInformation(
    namehash: string
  ): Promise<DomainInformation> {
    const response = await this.client.get<DomainInformation>(namehash, {
      baseURL: 'https://unstoppabledomains.com/api/v1/'
    });
    return response.data;
  }

  public async getDomainMetadata(tokenURI: string): Promise<ERC721Meta> {
    const response = await this.client.get<ERC721Meta>(tokenURI);
    return response.data;
  }

  protected formatError(error: unknown): never {
    throw error;
  }
}
