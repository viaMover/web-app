import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { getPureEthAddress } from '@/utils/address';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  HOLY_HAND_ABI,
  HOLY_HAND_ADDRESS,
  HOLY_SAVINGS_POOL_ADDRESS
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

import { withdrawSubsidized } from './withdrawSubsidized';

export const withdrawCompound = async (
  outputAsset: SmallToken,
  outputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  actionGasLimit: string,
  useSubsidized: boolean,
  changeStepToProcess: () => Promise<void>,
  gasPriceInGwei?: string
): Promise<void> => {
  try {
    if (useSubsidized) {
      await withdrawSubsidized(
        outputAsset,
        outputAmount,
        network,
        web3,
        accountAddress,
        changeStepToProcess
      );
    } else {
      await withdraw(
        outputAsset,
        outputAmount,
        network,
        web3,
        accountAddress,
        actionGasLimit,
        changeStepToProcess,
        gasPriceInGwei
      );
    }
  } catch (err) {
    console.error(`Can't savings withdraw:`, err);
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
  changeStepToProcess: () => Promise<void>,
  gasPriceInGwei?: string
): Promise<void> => {
  console.log('Executing savings withdraw...');

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

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

    const outputAmountInWEI = toWei(outputAmount, outputAsset.decimals);

    console.log('[savings withdraw] output amount in WEI:', outputAmountInWEI);

    console.log('[savings deposit] transactionParams:', transactionParams);

    let outputCurrencyAddress = outputAsset.address;
    if (outputAsset.address === 'eth') {
      outputCurrencyAddress = getPureEthAddress();
    }

    console.log(
      '[savings withdraw] outputCurrencyAddress:',
      outputCurrencyAddress
    );

    await new Promise<void>((resolve, reject) => {
      (
        holyHand.methods.withdrawFromPool(
          poolAddress,
          outputAmountInWEI
        ) as ContractSendMethod
      )
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Savings withdraw txn hash: ${hash}`);
          changeStepToProcess();
        })
        .once('receipt', (receipt: TransactionReceipt) => {
          console.log(`Savings withdraw txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Savings withdraw txn error: ${error}`);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`can't execute savings withdraw due to: ${error}`);
    throw error;
  }
};
