import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { TokenDate } from '@/store/modules/shop/types';
import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { NFT_NIBBLE_SHOP_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader/types';

export const getNibbleTokenData = async (
  tokenId: string,
  tokenAddres: string,
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<TokenDate> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;
  console.log(`getNibbleTokenData ${tokenId}`);

  return {
    tokenId: tokenId,
    tokenIntId: '123',
    balance: 1,
    totalClaimed: 2,
    redeemCount: 0
  };

  //
  // const contract = new web3.eth.Contract(
  // NFT_NIBBLE_SHOP_ABI as AbiItem[],
  // tokenAddres
  // );
  //
  // const balance = await contract.methods
  // .balanceOf(accountAddress)
  // .call(transactionParams);
  //
  // const totalClaimed = await contract.methods
  // .totalClaimed(accountAddress)
  // .call(transactionParams);
  //
  // const reedemCount = await contract.methods
  // .redeemCount(accountAddress)
  // .call(transactionParams);
  //
  // const tokenIntId = await contract.methods
  // .tokenOfOwnerByIndex(accountAddress, 0)
  // .call(transactionParams);
  //
  // return {
  // tokenId: tokenId,
  // tokenIntId: tokenIntId.toString(),
  // balance: balance.toString(),
  // totalClaimed: totalClaimed.toString(),
  // redeemCount: parseInt(reedemCount.toString())
  // };
  //
};

export const claimNibbleToken = async (
  tokenAddres: string,
  accountAddress: string,
  feeAmount: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = tokenAddres;

  const contract = new web3.eth.Contract(
    NFT_NIBBLE_SHOP_ABI as AbiItem[],
    contractAddress
  );

  console.info(
    `Fee amount to claim nibble shop NFT token[${tokenAddres}]: ${feeAmount}`
  );

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
        '[nibble shop token claim estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException(`Empty gas limit in nibble shop token claim`);
      gasLimit = '0';
    }
  } catch (err) {
    console.error("Can't estimate nibble shop token claim", err);
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

export const redeemNibbleToken = async (
  tokenAddres: string,
  tokenIntId: string,
  accountAddress: string,
  signature: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contract = new web3.eth.Contract(
    NFT_NIBBLE_SHOP_ABI as AbiItem[],
    tokenAddres
  );

  const transacionParamsEstimate: TransactionsParams = {
    from: accountAddress
  };

  let gasLimit;
  try {
    const gasLimitObj = await contract.methods
      .redeem(tokenIntId, signature)
      .estimateGas(transacionParamsEstimate);
    if (gasLimitObj) {
      const gasLimitRaw = gasLimitObj.toString();
      const gasLimitWithBuffer = floorDivide(
        multiply(gasLimitRaw, '120'),
        '100'
      );
      console.log(
        '[nibble shop token redeem] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      gasLimit = gasLimitWithBuffer;
    } else {
      Sentry.captureException('Empty gas limit in nibble shop token redeem');
      gasLimit = '0';
    }
  } catch (err) {
    console.error("Can't estimate nibble shop token redeem", err);
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
    contract.methods
      .redeem(tokenIntId, signature)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Redeem txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: unknown) => {
        console.log(`Redeem txn receipt: ${receipt}`);
        resolve();
      })
      .once('error', (error: Error) => {
        console.log(`Redeem txn error: ${error}`);
        reject();
      });
  });
};
