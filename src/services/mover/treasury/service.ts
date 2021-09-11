import axios from 'axios';

import { Result } from '../../responses';
import { baseUrl } from '../consts';
import {
  TreasuryInfo,
  TreasuryInfoResponse,
  TreasuryReceipt,
  TreasuryReceiptResponse
} from '@/services/mover/treasury/types';

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
        error: response.errorMessage
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
        error: response.errorMessage
      };
    }

    const payloadProcessed: TreasuryReceipt = {
      ...response.payload,
      hourlyBalances: response.payload.hourlyBalances.map((item) => ({
        ...item,
        type: 'treasury_hourly_balance_item'
      }))
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};
