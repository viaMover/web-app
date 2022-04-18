import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  lookupAddress,
  NFT_BASELEDGER_STAKING_OG_ABI
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader/types';

import { BaseledgerStakingOGData } from './types';

export const getBaseledgerStakingOGData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<BaseledgerStakingOGData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = lookupAddress(network, 'NFT_BASELEDGER_STAKING_OG');

  if (contractAddress === '0x1') {
    return {
      totalSupply: '0'
    };
  }

  const baseledgerStakingOG = new web3.eth.Contract(
    NFT_BASELEDGER_STAKING_OG_ABI as AbiItem[],
    contractAddress
  );

  const totalSupply = await baseledgerStakingOG.methods
    .totalSupply()
    .call(transactionParams);
  return {
    totalSupply: totalSupply.toString()
  };
};

export const claimBaseledgerStakingOG = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = lookupAddress(network, 'NFT_BASELEDGER_STAKING_OG');

  const baseledgerStakingOG = new web3.eth.Contract(
    NFT_BASELEDGER_STAKING_OG_ABI as AbiItem[],
    contractAddress
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit = undefined;
  try {
    const gasLimitObj = await baseledgerStakingOG.methods
      .claimNFT()
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[baseledger staking OG claim estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in BaseledgerStakingOG claim');
      gasLimit = '0';
    }
  } catch (err) {
    console.error("Can't estimate BaseledgerStakingOG claim", err);
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
    (baseledgerStakingOG.methods.claimNFT() as ContractSendMethod)
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
