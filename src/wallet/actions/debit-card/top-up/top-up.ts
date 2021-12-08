import * as Sentry from '@sentry/vue';
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
import { HOLY_HAND_ABI, HOLY_HAND_ADDRESS } from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const topUpCompound = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
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
        await topUp(
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
      },
      changeStepToProcess,
      approveGasLimit,
      gasPriceInGwei
    );
  } catch (err) {
    Sentry.addBreadcrumb({
      type: 'error',
      category: 'debit-card.top-up.topUpCompound',
      message: 'failed to top up',
      data: {
        error: err
      }
    });
    throw err;
  }
};

export const topUp = async (
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
): Promise<void | never> => {
  if (
    !sameAddress(inputAsset.address, outputAsset.address) &&
    transferData === undefined
  ) {
    throw 'TransferData is missing';
  }

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

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

  const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

  Sentry.addBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.topUp',
    message: 'input amount in WEI',
    data: {
      inputAmountInWEI
    }
  });

  let bytesData: number[] = [];
  let expectedMinimumReceived = '0';

  if (transferData) {
    expectedMinimumReceived = new BigNumber(
      multiply(transferData.buyAmount, '0.85')
    ).toFixed(0);

    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.topUp',
      message: 'expected minimum received',
      data: {
        expectedMinimumReceived
      }
    });

    const valueBytes = Web3.utils.hexToBytes(
      Web3.utils.padLeft(convertStringToHexWithPrefix(transferData.value), 64)
    );

    bytesData = Array.prototype.concat(
      Web3.utils.hexToBytes(transferData.to),
      Web3.utils.hexToBytes(transferData.allowanceTarget),
      valueBytes,
      Web3.utils.hexToBytes(transferData.data)
    );

    Sentry.addBreadcrumb({
      type: 'info',
      category: 'debit-card.top-up.topUp',
      message: 'bytes',
      data: {
        valueBytes: Web3.utils.bytesToHex(valueBytes),
        dataBytes: Web3.utils.bytesToHex(bytesData)
      }
    });
  }

  Sentry.addBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.topUp',
    message: 'transaction params',
    data: {
      ...transactionParams
    }
  });

  let inputCurrencyAddress = inputAsset.address;
  if (inputAsset.address === 'eth') {
    inputCurrencyAddress = getPureEthAddress();
  }

  Sentry.addBreadcrumb({
    type: 'info',
    category: 'debit-card.top-up.topUp',
    message: 'currencies',
    data: {
      inputCurrencyAddress,
      outputCurrencyAddress: outputAsset.address
    }
  });

  await new Promise<void>((resolve, reject) => {
    (
      holyHand.methods.cardTopUp(
        accountAddress,
        inputCurrencyAddress,
        inputAmountInWEI,
        expectedMinimumReceived,
        bytesData
      ) as ContractSendMethod
    )
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.topUp',
          message: 'transaction hash',
          data: {
            hash
          }
        });

        console.log('debug debit card top up txn hash', hash);
        changeStepToProcess();
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          category: 'debit-card.top-up.topUp',
          message: 'transaction receipt',
          data: {
            receipt
          }
        });
        console.debug('debit card top up txn receipt', receipt);
        resolve();
      })
      .once('error', (error: Error) => reject(error));
  });
};
