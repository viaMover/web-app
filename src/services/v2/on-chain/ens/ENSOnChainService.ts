import namehash from '@ensdomains/eth-ens-namehash';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { NetworkFeatureNotSupportedError } from '@/services/v2';
import { OnChainService } from '@/services/v2/on-chain';
import { ReverseRecordsContract } from '@/services/v2/on-chain/ens/types';
import { toArray } from '@/utils/arrays';
import { Network } from '@/utils/networkTypes';
import { lookupAddress, REVERSE_RECORDS_ABI } from '@/wallet/references/data';

export class ENSOnChainService extends OnChainService {
  protected readonly sentryCategoryPrefix = 'ens.on-chain.service';
  protected reverseRecordsContract: ReverseRecordsContract | undefined;

  constructor(currentAddress: string, network: Network, web3Client: Web3) {
    super(currentAddress, network, web3Client);

    this.reverseRecordsContract = this.createArbitraryContract(
      lookupAddress(network, 'ENS_REVERSE_RECORDS_CONTRACT'),
      REVERSE_RECORDS_ABI as AbiItem[]
    );
  }

  public getERC721TokenId(name: string): string {
    const label = name.replace(/\.(eth|xyz|luxe|kred|art)/, '');

    return new BigNumber(
      this.web3Client.utils.keccak256(
        this.web3Client.utils.hexToUtf8(
          this.web3Client.utils.stringToHex(label)
        )
      )
    ).toFixed();
  }

  public async getOwnDomainName(): Promise<string | undefined> {
    const res = await this.getNames(this.currentAddress);
    if (res.length < 1) {
      return undefined;
    }

    return res[0] !== '' ? res[0] : undefined;
  }

  public async getNames(
    addresses: string | Array<string>
  ): Promise<Array<string>> {
    const arg = toArray(addresses);
    return this.wrapWithSentryLogger(
      async () => {
        if (this.reverseRecordsContract === undefined) {
          throw new NetworkFeatureNotSupportedError(
            'Ethereum Name System',
            this.network
          );
        }

        console.debug(arg);

        const allNames = await this.reverseRecordsContract.methods
          .getNames(arg)
          .call({ from: this.currentAddress });

        console.debug(allNames);

        return allNames.filter((n) => n === namehash.normalize(n));
      },
      {
        addresses: arg
      }
    );
  }
}
