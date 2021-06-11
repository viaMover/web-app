import { GetGasErrors } from '@/wallet/gas';
import { Result } from './../responses';
import { Network } from '@/utils/networkTypes';
import axios from 'axios';
import { apiEndpoints } from './endpoints';
import {
  EtherScanResponse,
  EtherScanErrorResponse,
  isErrorResponse
} from './response';
import { GasData } from '@/wallet/types';

type EtherScanGasData = {
  LastBlock: string;
  SafeGasPrice: string;
  ProposeGasPrice: string;
  FastGasPrice: string;
};

export const getGasPrices = async (
  network = Network.mainnet
): Promise<Result<GasData, GetGasErrors>> => {
  const endpoint = apiEndpoints.get(network);
  if (endpoint === undefined) {
    return { isError: true, error: 'NoEndpointForNetwork' };
  }

  const url = `${endpoint}/api?module=gastracker&action=gasoracle`;

  try {
    const resp = (
      await axios.get<
        EtherScanResponse<EtherScanGasData> | EtherScanErrorResponse
      >(url)
    ).data;

    console.info('response:', url);

    if (isErrorResponse<EtherScanGasData>(resp)) {
      if (
        resp.result ===
        'Max rate limit reached, please use API Key for higher rate limit'
      ) {
        return { isError: true, error: 'RateReached' };
      }

      return { isError: true, error: `Service error: ${resp.message}` };
    }

    return {
      isError: false,
      result: {
        LastBlock: resp.result.LastBlock,
        FastGasPrice: resp.result.FastGasPrice,
        ProposeGasPrice: resp.result.ProposeGasPrice,
        SafeGasPrice: resp.result.SafeGasPrice
      } as GasData
    };
  } catch (err) {
    return { isError: true, error: `Request error: ${err}` };
  }
};
