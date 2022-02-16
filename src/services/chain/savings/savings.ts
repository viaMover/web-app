import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { fromWei, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getUSDCAssetData,
  HOLY_POOL_ABI,
  lookupAddress
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { GetSavingsAPYReturn } from './types';

export const getSavingsAPY = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<GetSavingsAPYReturn> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const holyPoolAddress = lookupAddress(network, 'HOLY_SAVINGS_POOL_ADDRESS');

  const HolyHand = new web3.eth.Contract(
    HOLY_POOL_ABI as AbiItem[],
    holyPoolAddress
  );

  const savingsDPYinWEI = await HolyHand.methods
    .getDailyAPY()
    .call(transactionParams);

  const savingsDPY = fromWei(savingsDPYinWEI, 18);
  const savingsAPY = multiply(savingsDPY, 365);
  return {
    apy: savingsAPY,
    dpy: savingsDPY
  };
};

export const getSavingsBalance = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet && network !== Network.kovan) {
    console.log(
      'saving balance is disabled for not ethereum mainnet or kovan: ',
      network
    );
    return '0';
  }

  const contractAddress = lookupAddress(network, 'HOLY_SAVINGS_POOL_ADDRESS');
  const contractABI = HOLY_POOL_ABI;

  const savings = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  try {
    console.log('get savings USDC balance for user...');
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const savingsResponse = await savings.methods
      .getDepositBalance(accountAddress)
      .call(transactionParams);

    console.log('savings: USDC balance in WEI: ', savingsResponse);
    const savingsBalanceInWEI = new BigNumber(savingsResponse.toString());
    const savingsBalance = fromWei(
      savingsBalanceInWEI,
      getUSDCAssetData(network).decimals
    );
    console.log('savings: USDC BALANCEeBalance: ', savingsBalance);

    return savingsBalance;
  } catch (error) {
    throw new Error(`error getting savings USDC balance: ${error}`);
  }
};
