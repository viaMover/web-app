import Web3 from 'web3';
import { GetGasErrors } from '@/wallet/gas';
import { Result, isError } from './../responses';
import { Network } from '@/utils/networkTypes';
import { APIKeys } from '@/settings';
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

  const url = `${endpoint}/api?module=gastracker&action=gasoracle&apikey=${APIKeys.ETHERSCAN_API_KEY}`;

  try {
    const resp = (
      await axios.get<
        EtherScanResponse<EtherScanGasData> | EtherScanErrorResponse
      >(url)
    ).data;

    if (isErrorResponse<EtherScanGasData>(resp)) {
      if (
        resp.result ===
        'Max rate limit reached, please use API Key for higher rate limit'
      ) {
        return { isError: true, error: 'RateReached' };
      }

      return { isError: true, error: `Service error: ${JSON.stringify(resp)}` };
    }

    const fastGasSpeed = await getGasSpeedWithoutErr(
      resp.result.FastGasPrice,
      network
    );
    const proposeGasSpeed = await getGasSpeedWithoutErr(
      resp.result.ProposeGasPrice,
      network
    );
    const safeGasSpeed = await getGasSpeedWithoutErr(
      resp.result.SafeGasPrice,
      network
    );

    return {
      isError: false,
      result: {
        LastBlock: resp.result.LastBlock,
        FastGas: {
          price: resp.result.FastGasPrice,
          estTime: fastGasSpeed
        },
        ProposeGas: {
          price: resp.result.ProposeGasPrice,
          estTime: proposeGasSpeed
        },
        SafeGas: {
          price: resp.result.SafeGasPrice,
          estTime: safeGasSpeed
        }
      } as GasData
    };
  } catch (err) {
    return { isError: true, error: `Request error: ${err}` };
  }
};

export const getGasSpeed = async (
  gasPrice: string,
  network = Network.mainnet
): Promise<Result<string, GetGasErrors>> => {
  const endpoint = apiEndpoints.get(network);
  if (endpoint === undefined) {
    return { isError: true, error: 'NoEndpointForNetwork' };
  }

  const url = `${endpoint}/api?module=gastracker&action=gasestimate&gasprice=${gasPrice}&apikey=${APIKeys.ETHERSCAN_API_KEY}`;

  try {
    const resp = (
      await axios.get<EtherScanResponse<number> | EtherScanErrorResponse>(url)
    ).data;

    if (isErrorResponse<number>(resp)) {
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
      result: String(resp.result)
    };
  } catch (err) {
    return { isError: true, error: `Request error: ${err}` };
  }
};

export const getGasSpeedWithoutErr = async (
  gasPriceInGwei: string,
  network = Network.mainnet
): Promise<string> => {
  const gasPriceInWei = Web3.utils.toWei(gasPriceInGwei, 'Gwei');
  const res = await getGasSpeed(gasPriceInWei, network);
  if (isError<string, GetGasErrors>(res)) {
    console.log(res.error);
    return '0';
  }
  return res.result;
};
