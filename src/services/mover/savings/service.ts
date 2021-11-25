import axios from 'axios';

import {
  SavingsInfo,
  SavingsInfoResponse,
  SavingsReceipt,
  SavingsReceiptResponse
} from '@/services/mover/savings/types';

import { Result } from '../../responses';
import { baseUrl } from '../consts';

export const getSavingsInfo = async (
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
        error: response.error
      };
    }

    const payloadProcessed: SavingsInfo = {
      ...response.payload,
      last12MonthsBalances: response.payload.last12MonthsBalances.map(
        (item) => ({
          ...item,
          type: 'savings_month_balance_item'
        })
      )
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};

export const getSavingsReceipt = async (
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
        error: response.error
      };
    }

    const payloadProcessed: SavingsReceipt = {
      ...response.payload,
      hourlyBalances: response.payload.hourlyBalances.map((item) => ({
        ...item,
        type: 'savings_hourly_balance_item'
      }))
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};
