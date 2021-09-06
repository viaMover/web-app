import { Network } from '@/utils/networkTypes';
import Web3 from 'web3';
import { VaultsData } from '@/services/chain';
import { TransactionsParams } from '@/wallet/types';
import {
  NFT_UNEXPECTED_MOVE_ABI,
  NFT_UNEXPECTED_MOVE_ADDRESS,
  NFT_VAULTS_ABI,
  NFT_VAULTS_ADDRESS
} from '@/wallet/references/data';
import { AbiItem } from 'web3-utils';
import { Step } from '@/components/controls/form-loader';
import { floorDivide, multiply } from '@/utils/bigmath';
import * as Sentry from '@sentry/vue';

export const getVaultsData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<VaultsData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = NFT_VAULTS_ADDRESS(network);

  const vaults = new web3.eth.Contract(
    NFT_VAULTS_ABI as AbiItem[],
    contractAddress
  );

  const totalAmount = await vaults.methods
    ._claimLimit()
    .call(transactionParams);

  const totalClaimed = await vaults.methods
    ._totalClaimed()
    .call(transactionParams);

  return {
    totalAmount: totalAmount.toString(),
    totalClaimed: totalClaimed.toString()
  };
};

export const claimVaults = async (
  accountAddress: string,
  signature: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = NFT_VAULTS_ADDRESS(network);

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
      .claimNFT(signature)
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[unexpected move claim estimation] gas estimation by web3 (with additional 20% as buffer): ' +
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
    gasPrice: web3.utils
      .toWei(web3.utils.toBN(gasPriceInGwei), 'gwei')
      .toString()
  };

  await new Promise<void>((resolve, reject) => {
    vaults.methods
      .claimNFT(signature)
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
