/**
 * Special token that should be handled specifically to be used by the DEX
 */
import Web3 from 'web3';

import { EstimateResponse } from '@/services/v2/on-chain/mover';
import { Network } from '@/utils/networkTypes';
import { SmallToken, SmallTokenInfo } from '@/wallet/types';

import { LoaderStep } from '@/components/forms';

export interface IWrappedToken {
  readonly network: Network;

  /**
   * Returns an unwrapped token version
   */
  getUnwrappedToken(): SmallTokenInfo;

  /**
   * Returns whether the class can handle inputAsset
   * @description This predicate is used in responsibility checks
   * @param assetAddress token address to check
   */
  canHandle(assetAddress: string, network: Network): boolean;

  /**
   * Estimate unwrap (unstake) operation
   * @param inputAsset wrapped (staked) token to be used
   * @param inputAmount amount of wrapped (staked) token
   */
  estimateUnwrap(
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    web3: Web3,
    accountAddress: string
  ): Promise<EstimateResponse>;

  /**
   * Unwrap (unstake) token to be used by the DEX later on
   * @param inputAsset wrapped (staked) token to be used
   * @param inputAmount amount of wrapped (staked) token
   * @param changeStepToProcess callback to be called on txHash
   * @param gasLimit max gas amount that can be used during execution
   * @returns amount of unwrapped token received after operation (delta)
   */
  unwrap(
    inputAsset: SmallToken,
    inputAmount: string,
    web3: Web3,
    accountAddress: string,
    changeStepToProcess: (step: LoaderStep) => Promise<void>,
    gasLimit: string
  ): Promise<string>;
}
