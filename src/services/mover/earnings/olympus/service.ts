import axios from 'axios';

import {
  OlympusInfo,
  OlympusInfoResponse
} from '@/services/mover/earnings/olympus/types';

import { Result } from '../../../responses';
import { baseUrl } from '../../consts';

export const getOlympusInfo = async (
  address: string
): Promise<Result<OlympusInfo, string>> => {
  try {
    const response = (
      await axios.get<OlympusInfoResponse>(
        //TODO check path
        `${baseUrl}/v1/earnings/olympus/info/${address}`,
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

    const payloadProcessed: OlympusInfo = {
      ...response.payload,
      last12MonthsBalances: response.payload.last12MonthsBalances.map(
        (item) => ({
          ...item,
          type: 'olympus_month_balance_item'
        })
      )
    };

    return { isError: false, result: payloadProcessed };
  } catch (err) {
    return { isError: true, error: String(err) };
  }
};
