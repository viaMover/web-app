import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { lookupAddress, WX_BTRFLY_ABI } from '@/wallet/references/data';
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
  const contractAddress = lookupAddress(network, 'WX_BTRFLY_TOKEN_ADDRESS');
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

  addSentryBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.unwrap',
    message: 'input amount in WEI',
    data: {
      inputAmountInWEI
    }
  });

  addSentryBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.unwrap',
    message: 'transaction params',
    data: {
      ...transactionParams
    }
  });

  addSentryBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.unwrap',
    message: 'currency'
  });

  await new Promise<void>((resolve, reject) => {
    (contract.methods.unwrapToBTRFLY(inputAmountInWEI) as ContractSendMethod)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.unwrap',
          message: 'transaction hash',
          data: {
            hash
          }
        });

        console.log('debug debit card top up unwrap txn hash', hash);
        changeStepToProcess('Process');
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        addSentryBreadcrumb({
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
