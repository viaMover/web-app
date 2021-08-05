import axios from 'axios';
import { Result } from './../responses';
import { Network } from '@/utils/networkTypes';
import APIKeys from '@/settings/keys';
import { apiEndpoints } from './endpoints';
import {
  EtherScanErrorResponse,
  EtherScanResponse,
  isErrorResponse
} from './response';

type EtherScanEthPriceData = {
  ethusd: string;
  ethusd_timestamp: string;
  ethbtc: string;
  ethbtc_timestamp: string;
};

export const getEthPrice = async (
  network = Network.mainnet
): Promise<Result<string, string>> => {
  const endpoint = apiEndpoints.get(network);
  if (endpoint === undefined) {
    return { isError: true, error: 'NoEndpointForNetwork' };
  }

  const url = `${endpoint}/api?module=stats&action=ethprice&apikey=${APIKeys.ETHERSCAN_API_KEY}`;

  try {
    const resp = (
      await axios.get<
        EtherScanResponse<EtherScanEthPriceData> | EtherScanErrorResponse
      >(url)
    ).data;

    if (isErrorResponse<EtherScanEthPriceData>(resp)) {
      if (
        resp.result ===
        'Max rate limit reached, please use API Key for higher rate limit'
      ) {
        return { isError: true, error: 'RateReached' };
      }

      return {
        isError: true,
        error: `Service error:  ${JSON.stringify(resp)}`
      };
    }

    return {
      isError: false,
      result: resp.result.ethusd
    };
  } catch (err) {
    return { isError: true, error: `Request error: ${err}` };
  }
};
