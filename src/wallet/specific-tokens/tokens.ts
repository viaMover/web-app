import Web3 from 'web3';

import { Network } from '@/utils/networkTypes';
import { EstimateResponse } from '@/wallet/actions/types';
import { SmallToken, SmallTokenInfo } from '@/wallet/types';

import { LoaderStep } from '@/components/forms';

export interface SpecificToken {
  getSpecificTokenInfo: () => SmallTokenInfo;
  getBasicTokenInfo: () => SmallTokenInfo;
  unwrap: (
    inputAsset: SmallToken,
    inputAmount: string,
    network: Network,
    web3: Web3,
    accountAddress: string,
    changeStepToProcess: (step: LoaderStep) => Promise<void>,
    gasLimit: string,
    gasPriceInGwei?: string
  ) => Promise<void | never>;

  estimate: (
    inputAsset: SmallToken,
    inputAmount: string,
    network: Network,
    web3: Web3,
    accountAddress: string
  ) => Promise<EstimateResponse>;
}
