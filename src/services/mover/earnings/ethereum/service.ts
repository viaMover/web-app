import axios from 'axios';

import {
  EthereumInfo,
  EthereumInfoResponse
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
