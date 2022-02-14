import axios from 'axios';

import { Result } from '../../responses';
import { baseUrl } from '../consts';
import { TransactionMoveTypeData, TransationsResponse } from './types';

export const getMoverTransactionsTypes = async (
  txs: string[]
): Promise<Result<TransactionMoveTypeData[], string>> => {
  if (txs.length < 1) {
    return { isError: false, result: [] };
  }

  try {
    const response = (
      await axios.post<TransationsResponse>(
        `${baseUrl}/v1/tx/txInfo`,
        {
          txIDs: txs
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    ).data;
    if (response.status !== 'ok' && response.error) {
      return {
        isError: true,
        error: response.error
      };
    }

    if (response.payload === undefined) {
      return {
        isError: true,
        error: 'Empty payload'
      };
    }

    return { isError: false, result: response.payload };
  } catch (err) {
    return {
      isError: true,
      error: err instanceof Error ? err.message : String(err)
    };
  }
};
