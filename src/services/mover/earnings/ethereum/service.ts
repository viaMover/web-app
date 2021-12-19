import axios from 'axios';

import {
  EthereumInfo,
  EthereumInfoResponse,
  EthereumReceipt,
  EthereumReceiptResponse
} from '@/services/mover/earnings/ethereum/types';

import { Result } from '../../../responses';
import { baseUrl } from '../../consts';

export const getEthereumInfo = async (
  address: string
): Promise<Result<EthereumInfo, string>> => {
  try {
    const response = (
      await axios.get<EthereumInfoResponse>(
        //TODO check path
        `${baseUrl}/v1/earnings/ethereum/info/${address}`,
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

    const payloadProcessed: EthereumInfo = {
      ...response.payload,
      last12MonthsBalances: response.payload.last12MonthsBalances.map(
        (item) => ({
          ...item,
          type: 'ethereum_month_balance_item'
        })
      )
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};

export const getEthereumReceipt = async (
  address: string,
  year: number,
  month: number
): Promise<Result<EthereumReceipt, string>> => {
  try {
    const response = (
      await axios.get<EthereumReceiptResponse>(
        `${baseUrl}/v1/earnings/ethereum/receipt/${address}/${year}/${month}`,
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

    const payloadProcessed: EthereumReceipt = {
      ...response.payload,
      hourlyBalances: response.payload.hourlyBalances.map((item) => ({
        ...item,
        type: 'ethereum_hourly_balance_item'
      }))
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};
