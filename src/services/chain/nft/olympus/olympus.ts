import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as Sentry from '@sentry/vue';

import { TransactionsParams } from '@/wallet/types';
import { OlympusData } from './types';
import { Network } from '@/utils/networkTypes';
import { NFT_OLYMPUS_ABI, NFT_OLYMPUS_ADDRESS } from '@/wallet/references/data';
import store from '@/store/index';
import { floorDivide, multiply } from '@/utils/bigmath';
import { Step } from '@/components/controls/form-loader/types';

export const getOlympusData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<OlympusData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = NFT_OLYMPUS_ADDRESS(network);

  const olympus = new web3.eth.Contract(
    NFT_OLYMPUS_ABI as AbiItem[],
    contractAddress
  );

  const totalClaimed = await olympus.methods
    .totalClaimed()
    .call(transactionParams);

  const balance = await olympus.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  const claimStart = await olympus.methods.claimStart().call(transactionParams);

  const claimEnd = await olympus.methods.claimEnd().call(transactionParams);

  return {
    totalClaimed: totalClaimed.toString(),
    balance: balance.toString(),
    claimStart: claimStart.toString(),
    claimEnd: claimEnd.toString()
  };
};

export const claimOlympus = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = NFT_OLYMPUS_ADDRESS(network);

  const olympus = new web3.eth.Contract(
    NFT_OLYMPUS_ABI as AbiItem[],
    contractAddress
  );

  let feeAmount = await olympus.methods.feeAmount().call({
    from: accountAddress
  });

  feeAmount = feeAmount.toString();

  console.info('Fee amount to calim Olympus: ', feeAmount);

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress,
    value: feeAmount
  };

  let gasLimit = undefined;
  try {
    const gasLimitObj = await olympus.methods
      .claimNFT()
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[olympus estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in olympus claim');
      gasLimit = '0';
    }
  } catch (err) {
    console.error("Can't estimate olympus claim", err);
    Sentry.captureException(err);
    gasLimit = '0';
  }

  const transactionParams: TransactionsParams = {
    from: accountAddress,
    gas: web3.utils.toBN(gasLimit).toNumber(),
    gasPrice: web3.utils
      .toWei(web3.utils.toBN(gasPriceInGwei), 'gwei')
      .toString(),
    value: feeAmount
  };

  await new Promise<void>((resolve, reject) => {
    olympus.methods
      .claimNFT()
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Claim txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: any) => {
        console.log(`Claim txn receipt: ${receipt}`);
        resolve();
      })
      .once('error', (error: Error) => {
        console.log(`Claim txn error: ${error}`);
        reject();
      });
  });
};
