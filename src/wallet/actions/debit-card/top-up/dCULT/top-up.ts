import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { DCULT_ABI, lookupAddress } from '@/wallet/references/data';
import { SmallTokenInfo, TransactionsParams } from '@/wallet/types';

import { LoaderStep } from '@/components/forms';

export const unstake = async (
  inputAsset: SmallTokenInfo,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: (step: LoaderStep) => Promise<void>,
  gasLimit: string
): Promise<TransactionReceipt> => {
  const contract = new web3.eth.Contract(
    DCULT_ABI as AbiItem[],
    lookupAddress(network, 'DCULT_TOKEN_ADDRESS')
  );

  const inputAmountInWei = toWei(inputAmount, inputAsset.decimals);
  const transactionParams: TransactionsParams = {
    from: accountAddress,
    gas: web3.utils.toBN(gasLimit).toNumber(),
    gasPrice: undefined,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null
  };

  addSentryBreadcrumb({
    type: 'debug',
    category: 'debit-card.top-up.dcult-unstake',
    message: 'About to send unstake tx',
    data: {
      inputAsset,
      inputAmount,
      inputAmountInWei,
      gasLimit,
      transactionParams
    }
  });

  return new Promise<TransactionReceipt>((resolve, reject) => {
    (contract.methods.withdraw('0', inputAmountInWei) as ContractSendMethod)
      .send(transactionParams)
      .on('transactionHash', (hash) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.dcult-unstake',
          message: 'Received tx hash',
          data: {
            hash
          }
        });

        changeStepToProcess('Process');
      })
      .on('receipt', (receipt) => {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.dcult -unstake',
          message: 'Received tx receipt',
          data: {
            receipt
          }
        });
        resolve(receipt);
      })
      .on('error', (error) => reject(error));
  });
};
