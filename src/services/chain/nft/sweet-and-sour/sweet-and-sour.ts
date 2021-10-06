import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as Sentry from '@sentry/vue';

import { TransactionsParams } from '@/wallet/types';
import { SweetAndSourData } from './types';
import { Network } from '@/utils/networkTypes';
import {
  NFT_SWEET_AND_SOUR_ABI,
  NFT_SWEET_AND_SOUR_ADDRESS
} from '@/wallet/references/data';
import { floorDivide, multiply } from '@/utils/bigmath';
import { Step } from '@/components/controls/form-loader/types';

export const getSweetAndSourData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<SweetAndSourData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = NFT_SWEET_AND_SOUR_ADDRESS(network);

  const sweetAndSour = new web3.eth.Contract(
    NFT_SWEET_AND_SOUR_ABI as AbiItem[],
    contractAddress
  );

  const totalAmount = await sweetAndSour.methods
    ._claimLimit()
    .call(transactionParams);

  const totalClaimed = await sweetAndSour.methods
    ._totalClaimed()
    .call(transactionParams);

  return {
    totalAmount: totalAmount.toString(),
    totalClaimed: totalClaimed.toString()
  };
};

export const claimSweetAndSour = async (
  accountAddress: string,
  signature: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = NFT_SWEET_AND_SOUR_ADDRESS(network);

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
    gasPrice: web3.utils
      .toWei(web3.utils.toBN(gasPriceInGwei), 'gwei')
      .toString()
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
