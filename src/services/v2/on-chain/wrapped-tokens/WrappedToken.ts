/**
 * Special token that should be handled specifically to be used by the DEX
 */
import Web3 from 'web3';

import { EstimateResponse } from '@/services/v2/on-chain/mover';
import { PromiEventWrapper } from '@/services/v2/on-chain/PromiEventWrapper';
import { Network } from '@/utils/networkTypes';
import { SmallToken, SmallTokenInfo } from '@/wallet/types';

export abstract class WrappedToken extends PromiEventWrapper {
  readonly network: Network;
  readonly web3: Web3;
  readonly accountAddress: string;

  protected constructor(network: Network, web3: Web3, accountAddress: string) {
    super();
    this.network = network;
    this.web3 = web3;
    this.accountAddress = accountAddress;
  }

  /**
   * Returns an amount of unwrapped token received after unwrap
   * @param wrappedTokenAmount - amount of wrapped token user wants to unwrap
   */
  abstract getUnwrappedAmount(wrappedTokenAmount: string): Promise<string>;

  /**
   * Returns an unwrapped token version
   */
  abstract getUnwrappedToken(): SmallTokenInfo;

  /**
   * Returns whether the class can handle inputAsset
   * @description This predicate is used in responsibility checks
   * @param assetAddress token address to check
   * @param network of address to check
   */
  abstract canHandle(assetAddress: string, network: Network): boolean;

  /**
   * Estimate unwrap (unstake) operation
   * @param inputAsset wrapped (staked) token to be used
   * @param inputAmount amount of wrapped (staked) token
   */
  abstract estimateUnwrap(
    inputAsset: SmallTokenInfo,
    inputAmount: string
  ): Promise<EstimateResponse>;

  /**
   * Unwrap (unstake) token to be used by the DEX later on
   * @param inputAsset wrapped (staked) token to be used
   * @param inputAmount amount of wrapped (staked) token
   * @param changeStepToProcess callback to be called on txHash
   * @param gasLimit max gas amount that can be used during execution
   * @returns amount of unwrapped token received after operation (delta)
   */
  abstract unwrap(
    inputAsset: SmallToken,
    inputAmount: string,
    changeStepToProcess: () => Promise<void>,
    gasLimit: string
  ): Promise<string>;
}
