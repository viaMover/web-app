import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as Sentry from '@sentry/vue';

import { TransactionsParams } from '@/wallet/types';
import { Network } from '@/utils/networkTypes';
import {
  NFT_UNEXPECTED_MOVE_ABI,
  NFT_UNEXPECTED_MOVE_ADDRESS
} from '@/wallet/references/data';
import { floorDivide, sub, multiply } from '@/utils/bigmath';
import { UnexpectedMoveData } from './types';
import { Step } from '@/components/controls/form-loader/types';

export const getUnexpectedMoveData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<UnexpectedMoveData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = NFT_UNEXPECTED_MOVE_ADDRESS(network);

  const unexpectedMove = new web3.eth.Contract(
    NFT_UNEXPECTED_MOVE_ABI as AbiItem[],
    contractAddress
  );

  const totalAmount = await unexpectedMove.methods
    ._claimLimit()
    .call(transactionParams);

  const totalClaimed = await unexpectedMove.methods
    ._totalClaimed()
    .call(transactionParams);

  const totalSupply = await unexpectedMove.methods
    .totalSupply()
    .call(transactionParams);

  const balance = await unexpectedMove.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  return {
    totalAmount: totalAmount.toString(),
    totalClaimed: totalClaimed.toString(),
    totalExchanged: sub(totalClaimed.toString(), totalSupply.toString()),
    balance: balance.toString()
  };
};

export const claimUnexpectedMove = async (
  accountAddress: string,
  signature: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => Promise<void>
): Promise<void> => {
  const contractAddress = NFT_UNEXPECTED_MOVE_ADDRESS(network);

  const sweetAndSour = new web3.eth.Contract(
    NFT_UNEXPECTED_MOVE_ABI as AbiItem[],
    contractAddress
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit = undefined;
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
        '[unexpected move claim estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in UnexpectedMove claim');
      throw new Error("Can't estimate UnexpectedMove claim");
    }
  } catch (err) {
    console.error("Can't estimate UnexpectedMove claim", err);
    Sentry.captureException(err);
    throw new Error("Can't estimate UnexpectedMove claim");
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

export const claimAndExchangeUnexpectedMove = async (
  accountAddress: string,
  signature: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => Promise<void>
): Promise<void> => {
  const contractAddress = NFT_UNEXPECTED_MOVE_ADDRESS(network);

  const sweetAndSour = new web3.eth.Contract(
    NFT_UNEXPECTED_MOVE_ABI as AbiItem[],
    contractAddress
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit = undefined;
  try {
    const gasLimitObj = await sweetAndSour.methods
      .claimAsMoverToken(signature)
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[unexpected move claim and exchange estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException(
        'Empty gas limit in UnexpectedMove claim and exchange'
      );
      throw new Error("Can't estimate UnexpectedMove claim and exchange");
    }
  } catch (err) {
    console.error("Can't estimate UnexpectedMove claim and exchange", err);
    Sentry.captureException(err);
    throw new Error("Can't estimate UnexpectedMove claim and exchange");
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
      .claimAsMoverToken(signature)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Claim and exchange txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: any) => {
        console.log(`Claim and exchange txn receipt: ${receipt}`);
        resolve();
      })
      .once('error', (error: Error) => {
        console.log(`Claim and exchange txn error: ${error}`);
        reject();
      });
  });
};

export const exchangeUnexpectedMove = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => Promise<void>
): Promise<void> => {
  const contractAddress = NFT_UNEXPECTED_MOVE_ADDRESS(network);

  const sweetAndSour = new web3.eth.Contract(
    NFT_UNEXPECTED_MOVE_ABI as AbiItem[],
    contractAddress
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit = undefined;
  try {
    const gasLimitObj = await sweetAndSour.methods
      .burnNFTForMoverTokens()
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[unexpected move exchange estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in UnexpectedMove exchange');
      throw new Error("Can't estimate UnexpectedMove exchange");
    }
  } catch (err) {
    console.error("Can't estimate UnexpectedMove exchange", err);
    Sentry.captureException(err);
    throw new Error("Can't estimate UnexpectedMove exchange");
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
      .burnNFTForMoverTokens()
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Exchange txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: any) => {
        console.log(`Exchange txn receipt: ${receipt}`);
        resolve();
      })
      .once('error', (error: Error) => {
        console.log(`Exchange txn error: ${error}`);
        reject();
      });
  });
};
