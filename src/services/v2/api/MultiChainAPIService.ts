import { Network } from '@/utils/networkTypes';

import { APIService } from './APIService';

export abstract class MultiChainAPIService extends APIService {
  protected readonly network: Network;

  protected constructor(currentAddress: string, network: Network) {
    super(currentAddress);
    this.network = network;
  }

  protected abstract lookupBaseURL(network?: Network): string;
}
