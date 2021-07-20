import { toWei } from '@/utils/bigmath';
import { MAXUINT256 } from '@/utils/consts';
import { ERC20_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

export const approve = async (
  accountAddress: string,
  tokenAddress: string,
  spenderAddress: string,
  gasLimit: string,
  gasPrice: string,
  web3: Web3,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tokenContract = new web3.eth.Contract(
      ERC20_ABI as AbiItem[],
      tokenAddress
    );
    try {
      const transactionParams = {
        from: accountAddress,
        gas: web3.utils.toBN(gasLimit).toNumber(),
        gasPrice: web3.utils.toWei(web3.utils.toBN(gasPrice), 'gwei').toString()
      } as TransactionsParams;

      tokenContract.methods
        .approve(spenderAddress, MAXUINT256)
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Approve txn hash: ${hash}`);
          changeStepToProcess();
        })
        .once('receipt', (receipt: any) => {
          console.log(`Approve txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Approve txn error: ${error}`);
          reject(error);
        });
    } catch (error) {
      reject(
        new Error(`can't make approve for token ${tokenAddress}: ${error}}`)
      );
    }
  });
};
