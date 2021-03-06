import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { lookupAddress, NFT_DICE_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader';

import { DiceData, DiceType } from './types';

export const getDiceData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<DiceData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = lookupAddress(network, 'NFT_DICE');

  if (contractAddress === '0x1') {
    return {
      totalClaimed: '0',
      balance: '0'
    };
  }

  const dice = new web3.eth.Contract(
    NFT_DICE_ABI as AbiItem[],
    contractAddress
  );

  const balance = await dice.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  const totalClaimed = await dice.methods
    .totalClaimed()
    .call(transactionParams);

  return {
    balance: balance.toString(),
    totalClaimed: totalClaimed.toString()
  };
};

export const claimDice = async (
  diceType: DiceType,
  accountAddress: string,
  network: Network,
  web3: Web3,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = lookupAddress(network, 'NFT_DICE');

  const dice = new web3.eth.Contract(
    NFT_DICE_ABI as AbiItem[],
    contractAddress
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit = undefined;
  try {
    const gasLimitObj = await dice.methods
      .claimNFT(diceType)
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[dice estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in Dice claim');
    }
  } catch (err) {
    console.error("Can't estimate Dice claim", err);
    Sentry.captureException(err);
  }

  const transactionParams: TransactionsParams = {
    from: accountAddress,
    gas: gasLimit ? web3.utils.toBN(gasLimit).toNumber() : undefined,
    gasPrice: undefined,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null
  };

  await new Promise<void>((resolve, reject) => {
    (dice.methods.claimNFT(diceType) as ContractSendMethod)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Claim txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        console.log(`Claim txn receipt: ${receipt}`);
        resolve();
      })
      .once('error', (error: Error) => {
        console.log(`Claim txn error: ${error}`);
        reject();
      });
  });
};
