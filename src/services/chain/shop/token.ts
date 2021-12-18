import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { TokenDate } from '@/store/modules/shop/types';
import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { NFT_NIBBLE_SHOP_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { Step } from '@/components/forms/form-loader/types';

export const getNibbleTokenData = async (
  tokenId: string,
  tokenAddress: string,
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<TokenDate> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;
  const contract = new web3.eth.Contract(
    NFT_NIBBLE_SHOP_ABI as AbiItem[],
    tokenAddress
  );

  const balance = await contract.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  const totalClaimed = await contract.methods
    .totalClaimed(accountAddress)
    .call(transactionParams);

  const reedemCount = await contract.methods
    .redeemCount(accountAddress)
    .call(transactionParams);

  const tokenIntId = await contract.methods
    .tokenOfOwnerByIndex(accountAddress, 0)
    .call(transactionParams);

  return {
    tokenId: tokenId,
    tokenIntId: tokenIntId.toString(),
    balance: balance.toString(),
    totalClaimed: totalClaimed.toString(),
    redeemCount: parseInt(reedemCount.toString())
  };
};

export const claimNibbleToken = async (
  tokenAddress: string,
  accountAddress: string,
  feeAmount: string,
  network: Network,
  web3: Web3,
  gasPriceInGwei: string,
  changeStep: (step: Step) => void
): Promise<void> => {
  const contractAddress = tokenAddress;

  const contract = new web3.eth.Contract(
    NFT_NIBBLE_SHOP_ABI as AbiItem[],
    contractAddress
  );

  console.info(
    `Fee amount to claim nibble shop NFT token[${tokenAddress}]: ${feeAmount}`
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
      Sentry.addBreadcrumb({
        type: 'error',
        category: 'nibble-shop.claim.claimNibbleToken',
        message: 'failed to estimate claim txn',
        data: {
          error: 'gasLimitObj is null'
        }
      });
      gasLimit = '0';
    }
  } catch (err) {
    Sentry.addBreadcrumb({
      type: 'error',
      category: 'nibble-shop.claim.claimNibbleToken',
      message: 'failed to estimate claim txn',
      data: {
        error: err
      }
    });
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
    (contract.methods.claim() as ContractSendMethod)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Claim txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          category: 'nibble-shop.claim.claim',
          message: 'transaction receipt',
          data: {
            receipt
          }
        });
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
      Sentry.addBreadcrumb({
        type: 'error',
        category: 'nibble-shop.redeem.redeemNibbleToken',
        message: 'failed to estimate redeem txn',
        data: {
          error: 'gasLimitObj is null'
        }
      });
      gasLimit = '0';
    }
  } catch (err) {
    Sentry.addBreadcrumb({
      type: 'error',
      category: 'nibble-shop.redeem.redeemNibbleToken',
      message: 'failed to estimate redeem txn',
      data: {
        error: err
      }
    });
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
    (contract.methods.redeem(tokenIntId, signature) as ContractSendMethod)
      .send(transactionParams)
      .once('transactionHash', (hash: string) => {
        console.log(`Redeem txn hash: ${hash}`);
        changeStep('Process');
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        Sentry.addBreadcrumb({
          type: 'debug',
          category: 'nibble-shop.redeem.redeem',
          message: 'transaction receipt',
          data: {
            receipt
          }
        });
        console.log(`Redeem txn receipt: ${receipt}`);
        resolve();
      })
      .once('error', (error: Error) => {
        console.log(`Redeem txn error: ${error}`);
        reject();
      });
  });
};
