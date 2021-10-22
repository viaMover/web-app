import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { Network } from '@/utils/networkTypes';
import {
  NFT_RARI_ABI,
  POWERCARD_ADDRESS,
  POWERCARD_STAKER
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/controls/form-loader/types';

export const approvePowercard = async (
  approveGasLimit: string,
  contractAddress: string,
  accountAddress: string,
  network: Network,
  web3: Web3,
  changeStepToProcess: (step: Step) => Promise<void>
): Promise<void> => {
  if (network !== Network.mainnet) {
    console.log('Powercard is disabled for not ethereum mainnet: ', network);
    return;
  }

  changeStepToProcess('Confirm');

  try {
    const transactionParams = {
      from: accountAddress,
      gas: web3.utils.toBN(approveGasLimit).toNumber(),
      gasPrice: undefined,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    } as TransactionsParams;

    const powercardRariAddress = POWERCARD_ADDRESS(network);
    const powercardRariABI = NFT_RARI_ABI;

    const rari = new web3.eth.Contract(
      powercardRariABI as AbiItem[],
      powercardRariAddress
    );

    console.log('[powercard approve] transactionParams:', transactionParams);

    await new Promise<void>((resolve, reject) => {
      rari.methods
        .setApprovalForAll(contractAddress, true)
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Powercard approve txn hash: ${hash}`);
          changeStepToProcess('Process');
        })
        .once('receipt', (receipt: any) => {
          console.log(`Powercard approve txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Powercard approve txn error: ${error}`);
          reject(error);
        });
    });

    return;
  } catch (error) {
    console.error(`can't execute powercard approve due to: ${error}`);
    throw error;
  }
};
export const isPowercardApproved = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<boolean> => {
  const contractAddress = POWERCARD_ADDRESS(network);
  const contractABI = NFT_RARI_ABI;

  const powercardStakerAddress = POWERCARD_STAKER(network);

  const rari = new web3.eth.Contract(contractABI as AbiItem[], contractAddress);

  try {
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const isApproved = await rari.methods
      .isApprovedForAll(accountAddress, powercardStakerAddress)
      .call(transactionParams);

    console.log('powercard approval: ', isApproved);
    return isApproved;
  } catch (error) {
    throw new Error(`error powercard approve check: ${error}`);
  }
};
