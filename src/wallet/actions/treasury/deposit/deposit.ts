import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { sameAddress } from '@/utils/address';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { executeTransactionWithApprove } from '@/wallet/actions/actionWithApprove';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  HOLY_HAND_ABI,
  HOLY_HAND_ADDRESS
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const depositCompound = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  actionGasLimit: string,
  approveGasLimit: string,
  changeStepToProcess: () => Promise<void>,
  gasPriceInGwei?: string
): Promise<void> => {
  const contractAddress = HOLY_HAND_ADDRESS(network);

  try {
    await executeTransactionWithApprove(
      inputAsset,
      contractAddress,
      inputAmount,
      accountAddress,
      web3,
      async () => {
        await deposit(
          inputAsset,
          inputAmount,
          network,
          web3,
          accountAddress,
          actionGasLimit,
          changeStepToProcess,
          gasPriceInGwei
        );
      },
      changeStepToProcess,
      approveGasLimit,
      gasPriceInGwei
    );
  } catch (err) {
    console.error(`Can't treasury deposit: ${err}`);
    throw err;
  }
};

export const deposit = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  gasLimit: string,
  changeStepToProcess: () => Promise<void>,
  gasPriceInGwei?: string
): Promise<void> => {
  console.log('Executing treasury deposit...');

  const move = getMoveAssetData(network);
  const slp = getMoveWethLPAssetData(network);

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  try {
    const holyHand = new web3.eth.Contract(
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

    console.log('[treasury deposit] input amount in WEI:', inputAmountInWEI);
    console.log('[treasury deposit] transactionParams:', transactionParams);

    let depositFunc: any;
    if (sameAddress(inputAsset.address, move.address)) {
      depositFunc = holyHand.methods.depositToTreasury(inputAmountInWEI, '0');
    } else if (sameAddress(inputAsset.address, slp.address)) {
      depositFunc = holyHand.methods.depositToTreasury('0', inputAmountInWEI);
    } else {
      throw new Error(
        `wrong token in treasury deposit: ${inputAsset.address} ${inputAsset.symbol}`
      );
    }

    await new Promise<void>((resolve, reject) => {
      depositFunc
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Treasury deposit txn hash: ${hash}`);
          changeStepToProcess();
        })
        .once('receipt', (receipt: any) => {
          console.log(`Treasury deposit txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Treasury deposit txn error: ${error}`);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`can't execute treasury deposit due to: ${error}`);
    throw error;
  }
};
