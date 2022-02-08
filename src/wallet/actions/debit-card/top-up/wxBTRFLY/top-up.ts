import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  WX_BTRFLY_ABI,
  WX_BTRFLY_TOKEN_ADDRESS
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const unwrap = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>,
  gasLimit: string,
  gasPriceInGwei?: string
): Promise<void | never> => {
  const contractAddress = WX_BTRFLY_TOKEN_ADDRESS(network);
  const contractABI = WX_BTRFLY_ABI;

  const contract = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
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

  Sentry.addBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.unwrap',
    message: 'input amount in WEI',
    data: {
      inputAmountInWEI
    }
  });

  Sentry.addBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.unwrap',
    message: 'transaction params',
    data: {
      ...transactionParams
    }
  });

  Sentry.addBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.unwrap',
    message: 'currency'
  });

  await new Promise<void>((resolve, reject) => {
    (contract.methods.unwrapToBTRFLY(inputAmountInWEI) as ContractSendMethod)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.unwrap',
          message: 'transaction hash',
          data: {
            hash
          }
        });

        console.log('debug debit card top up unwrap txn hash', hash);
        changeStepToProcess();
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.unwrap',
          message: 'transaction receipt',
          data: {
            receipt
          }
        });
        console.debug('debit card top up unwrap txn receipt', receipt);
        resolve();
      })
      .once('error', (error: Error) => reject(error));
  });
};
