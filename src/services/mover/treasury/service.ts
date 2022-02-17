import axios from 'axios';

import {
  TreasuryInfo,
  TreasuryInfoResponse,
  TreasuryReceipt,
  TreasuryReceiptResponse
} from '@/services/mover/treasury/types';
import { isFeatureEnabled } from '@/settings';

import { Result } from '../../responses';
import { baseUrl } from '../consts';

export const getTreasuryInfo = async (
  address: string
): Promise<Result<TreasuryInfo, string>> => {
  try {
    const response = (
      await axios.get<TreasuryInfoResponse>(
        `${baseUrl}/v1/treasury/info/${address}`,
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
        error: response.error
      };
    }

    const payloadProcessed: TreasuryInfo = {
      ...response.payload,
      last12MonthsBonuses: response.payload.last12MonthsBonuses.map((item) => ({
        ...item,
        type: 'treasury_month_bonuses_item'
      }))
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};

export const getTreasuryReceipt = async (
  address: string,
  year: number,
  month: number
): Promise<Result<TreasuryReceipt, string>> => {
  try {
    const response = (
      await axios.get<TreasuryReceiptResponse>(
        `${baseUrl}/v1/treasury/receipt/${address}/${year}/${month}`,
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
        error: response.error
      };
    }

    const payloadProcessed: TreasuryReceipt = {
      avgDailyEarnings: response.payload.avgDailyEarnings,
      avgDailySpendings: response.payload.avgDailySpendings,
      earnedThisMonth: response.payload.earnedThisMonth,
      endOfMonthBalanceMove: response.payload.endOfMonthBalanceMove,
      endOfMonthBalanceMoveLP: response.payload.endOfMonthBalanceMoveLP,
      spentThisMonth: response.payload.spentThisMonth,
      totalDepositsMove: response.payload.totalDepositsMove,
      totalDepositsMoveLP: response.payload.totalDepositsMoveLP,
      totalWithdrawalsMove: response.payload.totalWithdrawalsMove,
      totalWithdrawalsMoveLP: response.payload.totalWithdrawalsMoveLP,
      hourlyBalances: isFeatureEnabled('isTreasuryMonthlyChartEnabled')
        ? response.payload.hourlyBalances!.map((item) => ({
            ...item,
            type: 'treasury_hourly_balance_item'
          }))
        : undefined
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};
