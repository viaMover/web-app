import axios from 'axios';

import { APIKeys } from '@/settings';
import { Network } from '@/utils/networkTypes';

import { Result } from './../responses';
import { apiEndpoints } from './endpoints';
import {
  EtherScanErrorResponse,
  EtherScanResponse,
  isErrorResponse
} from './response';

type BlockNumberData = string;

export const getBlockNumberByUnixTs = async (
  timestamp: number,
  network = Network.mainnet
): Promise<Result<number, string>> => {
  const endpoint = apiEndpoints.get(network);
  if (endpoint === undefined) {
    return { isError: true, error: 'NoEndpointForNetwork' };
  }

  const url = `${endpoint}/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${APIKeys.ETHERSCAN_API_KEY}`;
  try {
    const resp = (
      await axios.get<
        EtherScanResponse<BlockNumberData> | EtherScanErrorResponse
      >(url)
    ).data;

    if (isErrorResponse<BlockNumberData>(resp)) {
      if (
        resp.result ===
        'Max rate limit reached, please use API Key for higher rate limit'
      ) {
        return { isError: true, error: 'RateReached' };
      }

      return {
        isError: true,
        error: `Service error: ${JSON.stringify(resp)}`
      };
    }

    // Some weird type assertions here due to typescript type resolvement issues.
    // It sees BlockNumberData as an alias to `string` other than custom type def
    // so EtherScanResponse<string> is basically equal to EtherScanErrorResponse
    // and we can't do much about it
    return {
      isError: false,
      result: Number.parseInt(
        (resp as unknown as EtherScanResponse<BlockNumberData>).result
      )
    };
  } catch (err) {
    return { isError: true, error: `Request error: ${err}` };
  }
};
