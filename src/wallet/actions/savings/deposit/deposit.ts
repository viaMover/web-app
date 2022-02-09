import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { TransferData } from '@/services/0x/api';
import { sameAddress } from '@/utils/address';
import {
  convertStringToHexWithPrefix,
  getPureEthAddress
} from '@/utils/address';
import { multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { executeTransactionWithApprove } from '@/wallet/actions/actionWithApprove';
import {
  HOLY_HAND_ABI,
  HOLY_HAND_ADDRESS,
  HOLY_SAVINGS_POOL_ADDRESS
} from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

import { depositSubsidized } from './depositSubsidized';

export const depositCompound = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
  useSubsidized: boolean,
  changeStepToProcess: () => Promise<void>,
  actionGasLimit: string,
  approveGasLimit: string,
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
        if (useSubsidized) {
          await depositSubsidized(
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
          await deposit(
            inputAsset,
            outputAsset,
            inputAmount,
            transferData,
            network,
            web3,
            accountAddress,
            changeStepToProcess,
            actionGasLimit,
            gasPriceInGwei
          );
        }
      },
      changeStepToProcess,
      approveGasLimit,
      gasPriceInGwei
    );
  } catch (err) {
    console.error(`Can't savings deposit: `, err);
    throw err;
  }
};

export const deposit = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>,
  gasLimit: string,
  gasPriceInGwei?: string
): Promise<void> => {
  console.log('Executing savings deposit...');

  if (
    !sameAddress(inputAsset.address, outputAsset.address) &&
    transferData === undefined
  ) {
    throw 'We need transafer data for not USDC token';
  }

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

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
      gasPrice: gasPriceInGwei
        ? web3.utils.toWei(web3.utils.toBN(gasPriceInGwei), 'gwei').toString()
        : undefined,
      maxFeePerGas: gasPriceInGwei ? undefined : null,
      maxPriorityFeePerGas: gasPriceInGwei ? undefined : null
    } as TransactionsParams;

    console.log(JSON.stringify(transactionParams));
    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    console.log('[savings deposit] input amount in WEI:', inputAmountInWEI);

    let bytesData: number[] = [];
    let expectedMinimumReceived = '0';

    if (transferData) {
      expectedMinimumReceived = new BigNumber(
        multiply(transferData.buyAmount, '0.85')
      ).toFixed(0);

      console.log(
        '[savings deposit] expected minimum received:',
        expectedMinimumReceived
      );

      const valueBytes = Web3.utils.hexToBytes(
        Web3.utils.padLeft(convertStringToHexWithPrefix(transferData.value), 64)
      );
      console.log(
        '[savings deposit] valueBytes:',
        Web3.utils.bytesToHex(valueBytes)
      );

      bytesData = Array.prototype.concat(
        Web3.utils.hexToBytes(transferData.to),
        Web3.utils.hexToBytes(transferData.allowanceTarget),
        valueBytes,
        Web3.utils.hexToBytes(transferData.data)
      );

      console.log(
        '[savings deposit] bytesData:',
        Web3.utils.bytesToHex(bytesData)
      );
    }

    console.log('[savings deposit] transactionParams:', transactionParams);

    let inputCurrencyAddress = inputAsset.address;
    if (inputAsset.address === 'eth') {
      inputCurrencyAddress = getPureEthAddress();
    }

    let outputCurrencyAddress = outputAsset.address;
    if (outputAsset.address === 'eth') {
      outputCurrencyAddress = getPureEthAddress();
    }

    console.log(
      '[savings deposit] inputCurrencyAddress:',
      inputCurrencyAddress
    );
    console.log(
      '[savings deposit] outputCurrencyAddress:',
      outputCurrencyAddress
    );

    await new Promise<void>((resolve, reject) => {
      (
        holyHand.methods.depositToPool(
          poolAddress,
          inputCurrencyAddress,
          inputAmountInWEI,
          expectedMinimumReceived,
          bytesData
        ) as ContractSendMethod
      )
        .send(transactionParams)
        .once('transactionHash', (hash: string) => {
          console.log(`Savings deposit txn hash: ${hash}`);
          changeStepToProcess();
        })
        .once('receipt', (receipt: TransactionReceipt) => {
          console.log(`Savings deposit txn receipt: ${receipt}`);
          resolve();
        })
        .once('error', (error: Error) => {
          console.log(`Savings deposit txn error: ${error}`);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`can't execute savings deposit due to: ${error}`);
    throw error;
  }
};
