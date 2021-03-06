import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { VaultsData } from '@/services/chain';
import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { lookupAddress, NFT_VAULTS_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader';

export const getVaultsData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<VaultsData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = lookupAddress(network, 'NFT_VAULTS');

  if (contractAddress === '0x1') {
    return {
      totalClaimed: '0',
      balance: '0',
      totalAmount: '0'
    };
  }

  const vaults = new web3.eth.Contract(
    NFT_VAULTS_ABI as AbiItem[],
    contractAddress
  );

  const balance = await vaults.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  const totalClaimed = await vaults.methods
    .totalClaimed()
    .call(transactionParams);

  return {
    balance: balance.toString(),
    totalAmount: '9999',
    totalClaimed: totalClaimed.toString()
  };
};

export const claimVaults = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = lookupAddress(network, 'NFT_VAULTS');

  const vaults = new web3.eth.Contract(
    NFT_VAULTS_ABI as AbiItem[],
    contractAddress
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit = undefined;
  try {
    const gasLimitObj = await vaults.methods
      .claimNFT()
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[vaults claim estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in Vaults claim');
      throw new Error("Can't estimate Vaults claim");
    }
  } catch (err) {
    console.error("Can't estimate Vaults claim", err);
    Sentry.captureException(err);
    throw new Error("Can't estimate Vaults claim");
  }

  const transactionParams: TransactionsParams = {
    from: accountAddress,
    gas: web3.utils.toBN(gasLimit).toNumber(),
    gasPrice: undefined,
    maxFeePerGas: null,
    maxPriorityFeePerGas: null
  };

  await new Promise<void>((resolve, reject) => {
    (vaults.methods.claimNFT() as ContractSendMethod)
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
