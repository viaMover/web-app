import axios from 'axios';
import { Result } from '../responses';
import { baseUrl } from './consts';
import { MoverResponse } from './responses';

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

export type SavingsInfoResponsePayload = {
  currentBalance: number;
  currentPoolBalance: number;
  earnedTotal: number;
  earnedThisMonth: number;
  last12MonthsBalances: Array<MonthBalanceItem>;
  actionHistory: Array<ActionHistoryItem>;
};

export type SavingsInfo = MoverResponse<SavingsInfoResponsePayload>;

export const GetSavingsInfo = async (
  address: string
): Promise<Result<SavingsInfo, string>> => {
  try {
    const response = (
      await axios.get<SavingsInfo>(`${baseUrl}/v1/savings/info/${address}`, {
        headers: {
          Accept: 'application/json'
        }
      })
    ).data;
    if (response.status !== 'ok') {
      return {
        isError: true,
        error: response.errorMessage
      };
    }

    return { isError: false, result: response };
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

export type SavingsReceiptResponsePayload = {
  endOfMonthBalance: number;
  earnedThisMonth: number;
  hourlyBalances: Array<HourlyBalancesItem>;
  monthActionHistory: Array<ActionHistoryItem>;
  totalDeposits: number;
  totalWithdrawals: number;
};

export type SavingsReceipt = MoverResponse<SavingsInfo>;

export const GetSavingsReceipt = async (
  address: string,
  year: number,
  month: number
): Promise<Result<SavingsReceipt, string>> => {
  try {
    const response = (
      await axios.get<SavingsReceipt>(
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

    return { isError: false, result: response };
  } catch (err) {
    return { isError: true, error: err };
  }
};
