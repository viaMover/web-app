import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { getTransferData, TransferData } from '@/services/0x/api';
import { currentBalance } from '@/services/chain/erc20/balance';
import { OnChainServiceError } from '@/services/v2/on-chain';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { fromWei, lessThanOrEqual, sub, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { TopUpData } from '@/wallet/actions/debit-card/top-up/top-up';
import {
  getSimpleYearnVaultTokenByAddress,
  getSlippage,
  getUSDCAssetData,
  YEARN_SIMPLE_VAULT_ABI
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

import { LoaderStep } from '@/components/forms';

export const unwrap = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: (step: LoaderStep) => Promise<void>,
  gasLimit: string,
  gasPriceInGwei?: string
): Promise<void | never> => {
  const simpleYearnVault = getSimpleYearnVaultTokenByAddress(
    inputAsset.address,
    network
  );

  if (simpleYearnVault === undefined) {
    addSentryBreadcrumb({
      type: 'error',
      category: 'yearn.vault.simple.unwrap',
      message: 'failed to unwrap: can not find simple yearn vault',
      data: {
        address: inputAsset.address
      }
    });

    throw new OnChainServiceError(
      'Failed to estimate simple yearn vault unwrap'
    );
  }

  const contractABI = YEARN_SIMPLE_VAULT_ABI;

  const contract = new web3.eth.Contract(
    contractABI as AbiItem[],
    simpleYearnVault.vaultToken.address
  );

  const transactionParams = {
    from: accountAddress,
    gas: web3.utils.toBN(gasLimit).toNumber(),
    gasPrice: gasPriceInGwei
      ? web3.utils.toWei(web3.utils.toBN(gasPriceInGwei), 'gwei').toString()
      : undefined,
    maxFeePerGas: gasPriceInGwei ? undefined : null,
    maxPriorityFeePerGas: gasPriceInGwei ? undefined : null
  } as TransactionsParams;

  const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

  addSentryBreadcrumb({
    type: 'info',
    category: 'yearn.vault.simple.unwrap',
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
    category: 'yearn.vault.simple.unwrap',
    message: 'transaction params',
    data: {
      ...transactionParams
    }
  });

  addSentryBreadcrumb({
    type: 'info',
    category: 'yearn.vault.simple.unwrap',
    message: 'currency'
  });

  await new Promise<void>((resolve, reject) => {
    (contract.methods.withdraw(inputAmountInWEI) as ContractSendMethod)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'yearn.vault.simple.unwrap',
          message: 'transaction hash',
          data: {
            hash
          }
        });

        console.log('debug yearn.vault.simple.unwrap txn hash', hash);
        changeStepToProcess('Process');
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'yearn.vault.simple.unwrap',
          message: 'transaction receipt',
          data: {
            receipt
          }
        });
        console.debug('debit yearn.vault.simple.unwrap txn receipt', receipt);
        resolve();
      })
      .once('error', (error: Error) => reject(error));
  });
};

export const unwrapForTopUpCompound = async (
  inputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: (step: LoaderStep) => Promise<void>,
  unwrapGasLimit: string,
  gasPriceInGwei?: string
): Promise<TopUpData> => {
  const res: TopUpData = {
    inputAsset,
    inputAmount,
    transferData
  };

  try {
    addSentryBreadcrumb({
      type: 'info',
      category: 'yearn.vault.simple.preTopUp',
      message: 'For simple yearn vault we need to unwrap it',
      data: {
        inputAsset,
        inputAmount
      }
    });

    const simpleYearnVault = getSimpleYearnVaultTokenByAddress(
      inputAsset.address,
      network
    );

    if (simpleYearnVault === undefined) {
      addSentryBreadcrumb({
        type: 'error',
        category: 'yearn.vault.simple.preTopUp',
        message: 'failed to unwrap: can not find simple yearn vault',
        data: {
          address: inputAsset.address
        }
      });

      throw new OnChainServiceError('can not find simple yearn vault');
    }

    res.inputAsset = simpleYearnVault.commonToken;

    const balanceBeforeUnwrap = await currentBalance(
      web3,
      accountAddress,
      res.inputAsset.address
    );

    await unwrap(
      inputAsset,
      inputAmount,
      network,
      web3,
      accountAddress,
      changeStepToProcess,
      unwrapGasLimit,
      gasPriceInGwei
    );

    const balanceAfterUnwrap = await currentBalance(
      web3,
      accountAddress,
      res.inputAsset.address
    );

    const diffAmountInWei = sub(balanceAfterUnwrap, balanceBeforeUnwrap);

    if (lessThanOrEqual(diffAmountInWei, '0')) {
      throw new OnChainServiceError(
        'amount after unwrap less than or equal to zero'
      );
    }

    res.inputAmount = fromWei(diffAmountInWei, res.inputAsset.decimals);
    res.transferData = await getTransferData(
      getUSDCAssetData(network).address,
      res.inputAsset.address,
      diffAmountInWei,
      true,
      getSlippage(res.inputAsset.address, network),
      network
    );

    return res;
  } catch (err) {
    addSentryBreadcrumb({
      type: 'error',
      category: 'yearn.vault.simple.unwrap',
      message: 'failed to unwrap for top up',
      data: {
        error: err
      }
    });
    throw err;
  }
};
