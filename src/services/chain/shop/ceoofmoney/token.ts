import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { TokenDate } from '@/store/modules/shop/types';
import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  NFT_CEO_OF_MONEY_ABI,
  NFT_CEO_OF_MONEY_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader/types';
export const getCeoOfMoneyTokenData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<TokenDate> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;
  console.log('refreshAssetsInfoList 1');
  const contractAddress = NFT_CEO_OF_MONEY_ADDRESS(network);

  // const contract = new web3.eth.Contract(
  //   NFT_CEO_OF_MONEY_ABI as AbiItem[],
  //   contractAddress
  // );

  // const totalClaimed = await contract.methods
  //   .totalClaimed()
  //   .call(transactionParams);

  // const balance = await contract.methods
  //   .balanceOf(accountAddress)
  //   .call(transactionParams);

  // const totalSupplyCap = await contract.methods
  //   .totalCup(accountAddress)
  //   .call(transactionParams);

  // return {
  //   totalClaimed: totalClaimed.toString(),
  //   balance: balance.toString(),
  //   totalSupplyCap: totalSupplyCap.toString()
  // };
  console.log('refreshAssetsInfoList 2');
  return {
    totalClaimed: 0,
    balance: 0,
    totalSupplyCap: 22
  };
};

export const claimCeoOfMoney = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = NFT_CEO_OF_MONEY_ADDRESS(network);

  const contract = new web3.eth.Contract(
    NFT_CEO_OF_MONEY_ABI as AbiItem[],
    contractAddress
  );

  const feeAmount = '0.042';

  console.info('Fee amount to calim Olympus: ', feeAmount);

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress,
    value: feeAmount
  };

  let gasLimit = undefined;
  try {
    const gasLimitObj = await contract.methods
      .claim()
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[ceo of money estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in ceo of money claim');
      gasLimit = '0';
    }
  } catch (err) {
    console.error("Can't estimate ceo of money claim", err);
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
    contract.methods
      .claim()
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
