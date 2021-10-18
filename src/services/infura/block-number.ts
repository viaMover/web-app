import axios from 'axios';

import { APIKeys } from '@/settings';
import { Network } from '@/utils/networkTypes';

import { Result } from './../responses';
import { apiEndpoints } from './endpoints';
import {
  ErrorCode,
  InfuraErrorResponse,
  InfuraResponse,
  isErrorResponse
} from './response';

type BlockNumberData = string;

export const getBlockNumber = async (
  network = Network.mainnet
): Promise<Result<number, string>> => {
  const endpoint = apiEndpoints.get(network);
  if (endpoint === undefined) {
    return { isError: true, error: 'NoEndpointForNetwork' };
  }

  const url = `${endpoint}/${APIKeys.INFURA_PROJECT_ID}`;
  try {
    const resp = (
      await axios.post<InfuraResponse<BlockNumberData> | InfuraErrorResponse>(
        url,
        {
          id: 0,
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: []
        }
      )
    ).data;

    if (isErrorResponse<BlockNumberData>(resp)) {
      if (resp.error.code === ErrorCode.ErrProjectRateExceeded) {
        return { isError: true, error: 'RateReached' };
      }

      return {
        isError: true,
        error: `Service error: ${JSON.stringify(resp)}`
      };
    }

    return {
      isError: false,
      result: Number.parseInt(resp.result, 16)
    };
  } catch (err) {
    return { isError: true, error: `Request error: ${err}` };
  }
};
