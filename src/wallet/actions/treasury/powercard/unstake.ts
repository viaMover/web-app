import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { Network } from '@/utils/networkTypes';
import { executeTransactionWithApproveExt } from '@/wallet/actions/actionWithApprove';
import {
  POWERCARD_STAKER,
  POWERCARD_STAKER_ABI
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/controls/form-loader/types';

import { approvePowercard, isPowercardApproved } from './approve';

export const unstakePowercardCompound = async (
  network: Network,
  web3: Web3,
  accountAddress: string,
  actionGasLimit: string,
  approveGasLimit: string,
  changeStepToProcess: (step: Step) => Promise<void>
): Promise<void> => {
  if (network !== Network.mainnet) {
    throw new Error(
      `Powercard is disabled for not ethereum mainnet: ${network}`
    );
  }

  const contractAddress = POWERCARD_STAKER(network);

  try {
    await executeTransactionWithApproveExt(
      async (): Promise<void> => {
        await unstake(
          web3,
          accountAddress,
          contractAddress,
          actionGasLimit,
          changeStepToProcess
        );
      },
      async (): Promise<boolean> => {
        return await isPowercardApproved(accountAddress, network, web3);
      },
      async (): Promise<void> => {
        await approvePowercard(
          approveGasLimit,
          contractAddress,
          accountAddress,
          network,
          web3,
          changeStepToProcess
        );
      }
    );
  } catch (err) {
    console.error(`Can't unstake powercard: ${err}`);
    throw err;
  }
};

export const unstake = async (
  web3: Web3,
  accountAddress: string,
  contractAddress: string,
  gasLimit: string,
  changeStepToProcess: (step: Step) => Promise<void>
): Promise<void> => {
  console.log('Executing powercard unstake...');
  changeStepToProcess('Confirm');

  const contractABI = POWERCARD_STAKER_ABI;

  try {
    const powercardStaker = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );
    const transactionParams = {
      from: accountAddress,
      gas: web3.utils.toBN(gasLimit).toNumber(),
      gasPrice: undefined,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    } as TransactionsParams;

    console.log('[powercard stake] transactionParams:', transactionParams);

    await new Promise<void>((resolve, reject) => {
      powercardStaker.methods
        .unstakePowercard()
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Powercard unstake txn hash: ${hash}`);
          changeStepToProcess('Process');
        })
        .once('receipt', (receipt: any) => {
          console.log(`Powercard unstake txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Powercard unstake txn error: ${error}`);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`can't execute powercard stake due to: ${error}`);
    throw error;
  }
};
