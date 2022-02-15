import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/0x/api';
import {
  convertStringToHexWithPrefix,
  getPureEthAddress
} from '@/utils/address';
import { multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { executeTransactionWithApprove } from '@/wallet/actions/actionWithApprove';
import { HOLY_HAND_ABI, lookupAddress } from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

import { swapSubsidized } from './swapSubsidized';

export const swapCompound = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData,
  network: Network,
  web3: Web3,
  accountAddress: string,
  swapGasLimit: string,
  approveGasLimit: string,
  gasPriceInGwei: string,
  useSubsidized: boolean,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');

  try {
    await executeTransactionWithApprove(
      inputAsset,
      contractAddress,
      inputAmount,
      accountAddress,
      web3,
      async () => {
        if (useSubsidized) {
          await swapSubsidized(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            network,
            web3,
            accountAddress,
            changeStepToProcess
          );
        } else {
          await swap(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            network,
            web3,
            accountAddress,
            swapGasLimit,
            gasPriceInGwei,
            changeStepToProcess
          );
        }
      },
      changeStepToProcess,
      approveGasLimit,
      gasPriceInGwei
    );
  } catch (err) {
    console.error(`Can't swap:`, err);
    throw err;
  }
};

export const swap = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData,
  network: Network,
  web3: Web3,
  accountAddress: string,
  gasLimit: string,
  gasPriceInGwei: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing swap...');

  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');
  const contractABI = HOLY_HAND_ABI;

  try {
    const holyHand = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    let value = undefined;

    if (transferData) {
      value = Web3.utils.toHex(transferData.value);
    }

    const transactionParams = {
      from: accountAddress,
      value: value,
      gas: web3.utils.toBN(gasLimit).toNumber(),
      gasPrice: web3.utils
        .toWei(web3.utils.toBN(gasPriceInGwei), 'gwei')
        .toString()
    } as TransactionsParams;

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    console.log('[swap] input amount in WEI:', inputAmountInWEI);

    let bytesData: number[] = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      console.log('[swap] expected minimum received:', expectedMinimumReceived);

      const valueBytes = Web3.utils.hexToBytes(
        Web3.utils.padLeft(convertStringToHexWithPrefix(transferData.value), 64)
      );
      console.log('[swap] valueBytes:', Web3.utils.bytesToHex(valueBytes));

      bytesData = Array.prototype.concat(
        Web3.utils.hexToBytes(transferData.to),
        Web3.utils.hexToBytes(transferData.allowanceTarget),
        valueBytes,
        Web3.utils.hexToBytes(transferData.data)
      );

      console.log('[swap] bytesData:', Web3.utils.bytesToHex(bytesData));
    }

    console.log('[swap] transactionParams:', transactionParams);

    let inputCurrencyAddress = inputAsset.address;
    if (inputAsset.address === 'eth') {
      inputCurrencyAddress = getPureEthAddress();
    }

    let outputCurrencyAddress = outputAsset.address;
    if (outputAsset.address === 'eth') {
      outputCurrencyAddress = getPureEthAddress();
    }

    console.log('[swap] inputCurrencyAddress:', inputCurrencyAddress);
    console.log('[swap] outputCurrencyAddress:', outputCurrencyAddress);

    await new Promise<void>((resolve, reject) => {
      (
        holyHand.methods.executeSwap(
          inputCurrencyAddress,
          outputCurrencyAddress,
          inputAmountInWEI,
          expectedMinimumReceived,
          bytesData
        ) as ContractSendMethod
      )
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Swap txn hash: ${hash}`);
          changeStepToProcess();
        })
        .once('receipt', (receipt: TransactionReceipt) => {
          console.log(`Swap txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Swap txn error: ${error}`);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`can't execute swap due to: ${error}`);
    throw error;
  }
};
