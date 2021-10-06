import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { sameAddress } from '@/utils/address';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  SMART_TREASURY_ABI,
  SMART_TREASURY_ADDRESS
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const withdrawCompound = async (
  outputAsset: SmallToken,
  outputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  actionGasLimit: string,
  gasPriceInGwei: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  try {
    await withdraw(
      outputAsset,
      outputAmount,
      network,
      web3,
      accountAddress,
      actionGasLimit,
      gasPriceInGwei,
      changeStepToProcess
    );
  } catch (err) {
    console.error(`Can't treasury withdraw: ${err}`);
    throw err;
  }
};

export const withdraw = async (
  outputAsset: SmallToken,
  outputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  gasLimit: string,
  gasPriceInGwei: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing treasury withdraw...');

  const move = getMoveAssetData(network);
  const slp = getMoveWethLPAssetData(network);

  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  try {
    const holyHand = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    const transactionParams = {
      from: accountAddress,
      gas: web3.utils.toBN(gasLimit).toNumber(),
      gasPrice: web3.utils
        .toWei(web3.utils.toBN(gasPriceInGwei), 'gwei')
        .toString()
    } as TransactionsParams;

    const outputAmountInWEI = toWei(outputAmount, outputAsset.decimals);

    console.log('[treasury withdraw] output amount in WEI:', outputAmountInWEI);
    console.log('[treasury deposit] transactionParams:', transactionParams);

    let withdrawFunc: any;
    if (sameAddress(outputAsset.address, move.address)) {
      withdrawFunc = holyHand.methods.withdraw(outputAmountInWEI, '0');
    } else if (sameAddress(outputAsset.address, slp.address)) {
      withdrawFunc = holyHand.methods.withdraw('0', outputAmountInWEI);
    } else {
      throw new Error(
        `wrong token in treasury withdraw: ${outputAsset.address} ${outputAsset.symbol}`
      );
    }

    await new Promise<void>((resolve, reject) => {
      withdrawFunc
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Treasury withdraw txn hash: ${hash}`);
          changeStepToProcess();
        })
        .once('receipt', (receipt: any) => {
          console.log(`Treasury withdraw txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Treasury withdraw txn error: ${error}`);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`can't execute treasury withdraw due to: ${error}`);
    throw error;
  }
};
