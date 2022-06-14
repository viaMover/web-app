import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { currentBalance } from '@/services/chain/erc20/balance';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { EstimateResponse } from '@/services/v2/on-chain/mover';
import { IWrappedToken } from '@/services/v2/on-chain/wrapped-tokens/WrappedToken';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { sameAddress } from '@/utils/address';
import { floorDivide, multiply, sub, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  GALCX_ABI,
  getALCXAssetData,
  lookupAddress
} from '@/wallet/references/data';
import { SmallToken, SmallTokenInfo, TransactionsParams } from '@/wallet/types';

import { LoaderStep } from '@/components/forms';

export class WrappedTokenGALCX implements IWrappedToken {
  private readonly sentryPrefix: string;
  public readonly network: Network;
  public readonly wrappedTokenAddress: string;
  public readonly contractABI = GALCX_ABI;

  constructor(network: Network) {
    this.network = network;
    this.sentryPrefix = `wrapped-token.galcx`;
    this.wrappedTokenAddress = lookupAddress(network, 'GALCX_TOKEN_ADDRESS');
  }

  getUnwrappedToken = (): SmallTokenInfo => getALCXAssetData(this.network);

  canHandle = (assetAddress: string, network: Network): boolean => {
    return (
      network === this.network &&
      sameAddress(this.wrappedTokenAddress, assetAddress)
    );
  };

  estimateUnwrap = async (
    inputAsset: SmallTokenInfo,
    inputAmount: string,
    web3: Web3,
    accountAddress: string
  ): Promise<EstimateResponse> => {
    try {
      const contract = new web3.eth.Contract(
        this.contractABI as AbiItem[],
        this.wrappedTokenAddress
      );

      const transactionParams = {
        from: accountAddress
      } as TransactionsParams;

      const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

      addSentryBreadcrumb({
        type: 'info',
        category: `${this.sentryPrefix}.estimate-unwrap`,
        message: 'input amount in WEI',
        data: {
          inputAmountInWEI
        }
      });

      addSentryBreadcrumb({
        type: 'info',
        category: `${this.sentryPrefix}.estimate-unwrap`,
        message: 'transaction params',
        data: {
          ...transactionParams
        }
      });

      const gasLimitObj = await (
        contract.methods.unwrapToBTRFLY(inputAmountInWEI) as ContractSendMethod
      ).estimateGas(transactionParams);

      if (gasLimitObj) {
        const gasLimit = gasLimitObj.toString();
        const gasLimitWithBuffer = floorDivide(
          multiply(gasLimit, '120'),
          '100'
        );

        addSentryBreadcrumb({
          type: 'info',
          category: `${this.sentryPrefix}.estimate-unwrap`,
          message: 'gas estimations',
          data: {
            gasLimit,
            gasLimitWithBuffer
          }
        });

        return { error: false, gasLimit: gasLimitWithBuffer };
      }
    } catch (error) {
      addSentryBreadcrumb({
        type: 'error',
        category: `${this.sentryPrefix}.estimate-unwrap`,
        message: 'failed to estimate top up',
        data: {
          error
        }
      });

      throw new OnChainServiceError('Failed to estimate unwrap').wrap(error);
    }

    throw new OnChainServiceError('Failed to estimate unwrap: empty gas limit');
  };

  unwrap = async (
    inputAsset: SmallToken,
    inputAmount: string,
    web3: Web3,
    accountAddress: string,
    changeStepToProcess: (step: LoaderStep) => Promise<void>,
    gasLimit: string
  ): Promise<string> => {
    const balanceBeforeUnwrap = await currentBalance(
      web3,
      accountAddress,
      inputAsset.address
    );

    await this._unwrap(
      inputAsset,
      inputAmount,
      web3,
      accountAddress,
      changeStepToProcess,
      gasLimit
    );

    const balanceAfterUnwrap = await currentBalance(
      web3,
      accountAddress,
      inputAsset.address
    );

    return sub(balanceAfterUnwrap, balanceBeforeUnwrap);
  };

  _unwrap = async (
    inputAsset: SmallToken,
    inputAmount: string,
    web3: Web3,
    accountAddress: string,
    changeStepToProcess: (step: LoaderStep) => Promise<void>,
    gasLimit: string
  ): Promise<void> => {
    const contract = new web3.eth.Contract(
      this.contractABI as AbiItem[],
      this.wrappedTokenAddress
    );

    const transactionParams = {
      from: accountAddress,
      gas: web3.utils.toBN(gasLimit).toNumber(),
      gasPrice: undefined,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    } as TransactionsParams;

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    addSentryBreadcrumb({
      type: 'info',
      category: `${this.sentryPrefix}.execute-unwrap`,
      message: 'input amount in WEI',
      data: {
        inputAmountInWEI
      }
    });

    addSentryBreadcrumb({
      type: 'info',
      category: `${this.sentryPrefix}.estimate-unwrap`,
      message: 'transaction params',
      data: {
        ...transactionParams
      }
    });

    addSentryBreadcrumb({
      type: 'info',
      category: `${this.sentryPrefix}.estimate-unwrap`,
      message: 'currency'
    });

    await new Promise<void>((resolve, reject) => {
      (contract.methods.unstake(inputAmountInWEI) as ContractSendMethod)
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          addSentryBreadcrumb({
            type: 'debug',
            category: `${this.sentryPrefix}.estimate-unwrap`,
            message: 'transaction hash',
            data: {
              hash
            }
          });

          changeStepToProcess('Process');
        })
        .once('receipt', (receipt: TransactionReceipt) => {
          addSentryBreadcrumb({
            type: 'debug',
            category: `${this.sentryPrefix}.estimate-unwrap`,
            message: 'transaction receipt',
            data: {
              receipt
            }
          });
          resolve();
        })
        .once('error', (error: Error) => reject(error));
    });
  };
}
