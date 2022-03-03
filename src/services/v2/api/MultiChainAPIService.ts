import { Network } from '@/utils/networkTypes';

import APIService from './ApiService';

export default abstract class MultiChainAPIService extends APIService {
  protected readonly network: Network;

  protected constructor(currentAddress: string, network: Network) {
    super(currentAddress);
    this.network = network;
  }

  protected abstract lookupBaseURL(network?: Network): string;
}
