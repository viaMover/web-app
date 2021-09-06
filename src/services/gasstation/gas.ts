import { GasPriceResponse } from './types';
import { APIKeys } from '@/settings';
import axios from 'axios';
import { GasData } from '@/wallet/types';

const API_ENDPOINT_GAS_PRICES = 'https://ethgasstation.info/api/ethgasAPI.json';

export const getGasPrices = async (): Promise<GasData> => {
  const url = `${API_ENDPOINT_GAS_PRICES}?api-key=${APIKeys.GAS_STATION_API_KEY}`;

  try {
    const resp = (await axios.get<GasPriceResponse>(url)).data;

    return {
      LastBlock: String(resp.blockNum),
      FastGas: {
        price: String(Math.floor(resp.fastest / 10)), // to Gwei
        estTime: String(Math.floor(resp.fastWait * 60)) // to sec
      },
      ProposeGas: {
        price: String(Math.floor(resp.average / 10)), // to Gwei
        estTime: String(Math.floor(resp.avgWait * 60)) // to sec
      },
      SafeGas: {
        price: String(Math.floor(resp.safeLow / 10)), // to Gwei
        estTime: String(Math.floor(resp.safeLowWait * 60)) // to sec
      }
    };
  } catch (err) {
    throw new Error(`Cant' get gas data from Gas Station: ${err}`);
  }
};
