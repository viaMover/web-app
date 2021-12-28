import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { Network } from '@/utils/networkTypes';
import {
  SMART_TREASURY_ABI,
  SMART_TREASURY_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const claimAndBurnMOBO = async (
  network: Network,
  web3: Web3,
  accountAddress: string,
  gasLimit: string,
  changeStepToProcess: () => Promise<void>,
  gasPriceInGwei?: string
): Promise<void> => {
  console.log('Executing treasury claim and burn MOBO...');

  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  try {
    const treasury = new web3.eth.Contract(
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

    await new Promise<void>((resolve, reject) => {
      (treasury.methods.burnMOBO() as ContractSendMethod)
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Treasury claim and burn MOBO txn hash: ${hash}`);
          changeStepToProcess();
        })
        .once('receipt', (receipt: TransactionReceipt) => {
          console.log(`Treasury claim and burnt MOBO txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Treasury claim and burn MOBO txn error: ${error}`);
          reject(error);
        });
    });
  } catch (error) {
    console.error(
      `can't execute treasury claim and burn MOBO due to: ${error}`
    );
    throw error;
  }
};
