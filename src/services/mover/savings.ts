import { BigNumber } from 'bignumber.js';
import axios from 'axios';
import { Result } from '../responses';
import { baseUrl } from './consts';
import { MoverResponse } from './responses';
import { AbiItem } from 'web3-utils';
import { Network } from '@/utils/networkTypes';
import {
  getUSDCAssetData,
  HOLY_POOL_ABI,
  HOLY_SAVINGS_POOL_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';
import Web3 from 'web3';
import { fromWei, multiply } from '@/utils/bigmath';

export type GetSavingsAPYReturn = {
  apy: string;
  dpy: string;
};

export const GetSavingsApy = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<GetSavingsAPYReturn> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const holyPoolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

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

export type MonthBalanceItem = {
  balance: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
};

export type ActionHistoryItem = {
  type: 'deposit' | 'withdraw';
  amount: number;
  txId: string;
  block: number;
  timestamp: number;
};

export type SavingsInfo = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<MonthBalanceItem>;
  actionHistory: Array<ActionHistoryItem>;
};

export type SavingsInfoResponse = MoverResponse<SavingsInfo>;

export const GetSavingsInfo = async (
  address: string
): Promise<Result<SavingsInfo, string>> => {
  try {
    const response = (
      await axios.get<SavingsInfoResponse>(
        `${baseUrl}/v1/savings/info/${address}`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      )
    ).data;
    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.errorMessage
      };
    }

    return { isError: false, result: response.payload };
  } catch (err) {
    return { isError: true, error: err };
  }
};

export type HourlyBalancesItem = {
  balance: number;
  snapshotTimestamp: number;
  year: number;
  month: number;
  day: number;
  hour: number;
};

export type SavingsReceipt = {
  endOfMonthBalance: number;
  earnedThisMonth: number;
  hourlyBalances: Array<HourlyBalancesItem>;
  monthActionHistory: Array<ActionHistoryItem>;
  totalDeposits: number;
  totalWithdrawals: number;
};

export type SavingsReceiptResponse = MoverResponse<SavingsReceipt>;

export const GetSavingsReceipt = async (
  address: string,
  year: number,
  month: number
): Promise<Result<SavingsReceipt, string>> => {
  try {
    const response = (
      await axios.get<SavingsReceiptResponse>(
        `${baseUrl}/v1/savings/receipt/${address}/${year}/${month}`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      )
    ).data;
    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.errorMessage
      };
    }

    return { isError: false, result: response.payload };
  } catch (err) {
    return { isError: true, error: err };
  }
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

  const contractAddress = HOLY_SAVINGS_POOL_ADDRESS(network);
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
