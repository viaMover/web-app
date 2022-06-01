import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { OnChainServiceError } from '@/services/v2/on-chain';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { EstimateResponse } from '@/wallet/actions/types';
import {
  getSimpleYearnVaultTokenByAddress,
  YEARN_SIMPLE_VAULT_ABI
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const estimateYearnSimpleUnwrap = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  const simpleYearnVault = getSimpleYearnVaultTokenByAddress(
    inputAsset.address,
    network
  );

  if (simpleYearnVault === undefined) {
    addSentryBreadcrumb({
      type: 'error',
      category: 'debit-card.top-up.estimateSimpleYearnVaultUnwrap',
      message: 'failed to estimate top up: can not find simple yearn vault',
      data: {
        address: inputAsset.address
      }
    });

    throw new OnChainServiceError(
      'Failed to estimate simple yearn vault unwrap'
    );
  }

  const contractABI = YEARN_SIMPLE_VAULT_ABI;

  try {
    const simpleYearnVaultContract = new web3.eth.Contract(
      contractABI as AbiItem[],
      simpleYearnVault.vaultToken.address
    );

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateSimpleYearnVaultUnwrap',
      message: 'input amount in WEI',
      data: {
        inputAmountInWEI,
        vaultName: simpleYearnVault.name,
        vaultAddress: simpleYearnVault.vaultToken.address,
        vaultCommonToken: simpleYearnVault.commonToken.address
      }
    });

    addSentryBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.estimateSimpleYearnVaultUnwrap',
      message: 'transaction params',
      data: {
        ...transactionParams
      }
    });

    const gasLimitObj = await (
      simpleYearnVaultContract.methods.withdraw(
        inputAmountInWEI
      ) as ContractSendMethod
    ).estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');

      addSentryBreadcrumb({
        type: 'info',
        category: 'debit-card.top-up.estimateSimpleYearnVaultUnwrap',
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
      category: 'debit-card.top-up.estimateSimpleYearnVaultUnwrap',
      message: 'failed to estimate top up',
      data: {
        error
      }
    });

    throw new OnChainServiceError(
      'Failed to estimate simple yearn vault unwrap'
    ).wrap(error);
  }

  throw new OnChainServiceError(
    'Failed to estimate simple yearn vault unwrap: empty gas limit'
  );
};
