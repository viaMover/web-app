import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { OnChainService } from '@/services/v2/on-chain';
import { Network } from '@/utils/networkTypes';
import {
  lookupAddress,
  UNS_RESOLVER_CONTRACT_ABI
} from '@/wallet/references/data';

import { RegistryContract } from './types';

export class UNSOnChainService extends OnChainService {
  protected readonly sentryCategoryPrefix =
    'unstoppable-domains.on-chain.service';
  protected registryContract: RegistryContract | undefined;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);
    this.registryContract = this.createArbitraryContract(
      lookupAddress(network, 'UNS_RESOLVER_CONTRACT'),
      UNS_RESOLVER_CONTRACT_ABI as AbiItem[]
    );
  }

  public async balanceOf(): Promise<string> {
    return this.wrapWithSentryLogger(() => {
      if (this.registryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Unstoppable Naming Service',
          this.network
        );
      }

      return this.registryContract.methods
        .balanceOf(this.currentAddress)
        .call({ from: this.currentAddress });
    });
  }

  public async getTokenId(): Promise<string> {
    return this.wrapWithSentryLogger(() => {
      if (this.registryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Unstoppable Naming Service',
          this.network
        );
      }

      return this.registryContract.methods
        .reverseOf(this.currentAddress)
        .call({ from: this.currentAddress });
    });
  }

  public async getTokenURI(tokenId: string): Promise<string> {
    return this.wrapWithSentryLogger(() => {
      if (this.registryContract === undefined) {
        throw new NetworkFeatureNotSupportedError(
          'Unstoppable Naming Service',
          this.network
        );
      }

      return this.registryContract.methods
        .tokenURI(tokenId)
        .call({ from: this.currentAddress });
    });
  }
}
