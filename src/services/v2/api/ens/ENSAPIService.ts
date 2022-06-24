import axios, { AxiosInstance } from 'axios';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { MultiChainAPIService } from '@/services/v2/api';
import { ERC721Meta } from '@/services/v2/api/ens/types';
import { Network } from '@/utils/networkTypes';
import { lookupAddress } from '@/wallet/references/data';

export class ENSAPIService extends MultiChainAPIService {
  protected baseURL: string;
  protected readonly client: AxiosInstance;
  protected readonly sentryCategoryPrefix = 'ens.api.service';

  constructor(currentAddress: string, network: Network) {
    super(currentAddress, network);
    this.baseURL = this.lookupBaseURL(network);
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Accept: 'application/json'
      },
      paramsSerializer: this.getParamsSerializer
    });
  }

  public async getERC721Meta(tokenId: string): Promise<ERC721Meta> {
    return (await this.client.get<ERC721Meta>(tokenId)).data;
  }

  protected formatError(error: unknown): never {
    throw error;
  }

  protected lookupBaseURL(network: Network): string {
    const contractAddress = lookupAddress(network, 'ENS_NFT_CONTRACT');

    if (network === Network.mainnet) {
      return `https://metadata.ens.domains/mainnet/${contractAddress}`;
    } else if (network === Network.rinkeby) {
      return `https://metadata.ens.domains/rinkeby/${contractAddress}`;
    } else if (network === Network.ropsten) {
      return `https://metadata.ens.domains/ropsten/${contractAddress}`;
    } else {
      throw new NetworkFeatureNotSupportedError(
        'Ethereum Name Service',
        this.network
      );
    }
  }
}
