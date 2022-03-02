import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  lookupAddress,
  NFT_SWEET_AND_SOUR_ABI
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader/types';

import { SweetAndSourData } from './types';

export const getSweetAndSourData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<SweetAndSourData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = lookupAddress(network, 'NFT_SWEET_AND_SOUR');

  if (contractAddress === '0x1') {
    return {
      totalClaimed: '0',
      balance: '0',
      totalAmount: '0'
    };
  }

  const sweetAndSour = new web3.eth.Contract(
    NFT_SWEET_AND_SOUR_ABI as AbiItem[],
    contractAddress
  );

  const balance = await sweetAndSour.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  const totalAmount = await sweetAndSour.methods
    ._claimLimit()
    .call(transactionParams);

  const totalClaimed = await sweetAndSour.methods
    ._totalClaimed()
    .call(transactionParams);

  return {
    balance: balance.toString(),
    totalAmount: totalAmount.toString(),
    totalClaimed: totalClaimed.toString()
  };
};

export const claimSweetAndSour = async (
  accountAddress: string,
  signature: string,
  network: Network,
  web3: Web3,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = lookupAddress(network, 'NFT_SWEET_AND_SOUR');

  const sweetAndSour = new web3.eth.Contract(
    NFT_SWEET_AND_SOUR_ABI as AbiItem[],
    contractAddress
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit;
  try {
    const gasLimitObj = await sweetAndSour.methods
      .claimNFT(signature)
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[sweet and sour estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in SweetAndSour claim');
      gasLimit = '0';
    }
  } catch (err) {
    console.error("Can't estimate SweetAndSour claim", err);
    Sentry.captureException(err);
    gasLimit = '0';
  }

  const transactionParams: TransactionsParams = {
    from: accountAddress,
    gas: web3.utils.toBN(gasLimit).toNumber(),
    gasPrice: undefined,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null
  };

  await new Promise<void>((resolve, reject) => {
    sweetAndSour.methods
      .claimNFT(signature)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Claim txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: unknown) => {
        console.log(`Claim txn receipt: ${receipt}`);
        resolve();
      })
      .once('error', (error: Error) => {
        console.log(`Claim txn error: ${error}`);
        reject();
      });
  });
};
