import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { OrderOfLibertyData } from '@/services/chain';
import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  lookupAddress,
  lookupConstant,
  NFT_ORDER_OF_LIBERTY_ABI
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader';

export const getOrderOfLibertyData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<OrderOfLibertyData> => {
  const contractAddress = lookupAddress(network, 'NFT_ORDER_OF_LIBERTY');
  if (contractAddress === '0x1') {
    return {
      balance: '0',
      totalSupply: '0',
      availablePrices: [],
      defaultPrice: '0'
    };
  }

  const contract = new web3.eth.Contract(
    NFT_ORDER_OF_LIBERTY_ABI as AbiItem[],
    contractAddress
  );

  console.log('contract', contract);

  const balanceResponse = await contract.methods
    .balanceOf(accountAddress)
    .call({ from: accountAddress });
  const totalSupplyResponse = await contract.methods
    .totalSupply()
    .call({ from: accountAddress });

  return {
    balance: balanceResponse.toString(),
    totalSupply: totalSupplyResponse.toString(),
    defaultPrice:
      lookupConstant(network, 'ORDER_OF_LIBERTY_DEFAULT_PRICE') ?? '0',
    availablePrices:
      lookupConstant(network, 'ORDER_OF_LIBERTY_AVAILABLE_PRICES') ?? []
  };
};

export const claimOrderOfLiberty = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  selectedPrice: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = lookupAddress(network, 'NFT_ORDER_OF_LIBERTY');
  if (contractAddress === '0x1') {
    return;
  }

  const contract = new web3.eth.Contract(
    NFT_ORDER_OF_LIBERTY_ABI as AbiItem[],
    contractAddress
  );

  let gasLimit;
  try {
    const gasLimitObj = await contract.methods
      .claimNFT()
      .estimateGas({ from: accountAddress, value: selectedPrice });
    if (gasLimitObj) {
      gasLimit = floorDivide(multiply(gasLimitObj.toString(), '120'), '100');
    } else {
      Sentry.captureException('Empty gas limit in OrderOfLiberty NFT');
      gasLimit = '0';
    }
  } catch (err) {
    console.error('Failed to estimate NFT claim', err);
    Sentry.captureException(err);
    gasLimit = '0';
  }

  const transactionParams: TransactionsParams = {
    from: accountAddress,
    gas: web3.utils.toBN(gasLimit).toNumber(),
    gasPrice: undefined,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
    value: selectedPrice
  };

  await new Promise<void>((resolve, reject) => {
    (contract.methods.claimNFT() as ContractSendMethod)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.info(`Claim txn hash`, hash);
        changeStep('Process');
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        console.info(`Claim txn receipt`, receipt);
        resolve();
      })
      .once('error', (error: Error) => {
        console.error(`Claim txn error`, error);
        reject();
      });
  });
};
