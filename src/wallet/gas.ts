import { isError, isSuccess } from './../services/responses';
import { Network } from '@/utils/networkTypes';
import { getGasPrices as getGasPricesFromEtherscan } from './../services/etherscan/gas';
import { asyncSleep } from '@/utils/time';
import { GasData } from './types';

export type GetGasErrors = 'RateReached' | 'NoEndpointForNetwork' | string;

const WAIT_INTERVAL = 6000; // 6 s

export const getGasPrices = async (
  network = Network.mainnet
): Promise<GasData> => {
  console.log('Getting new gas prices from etherscan...');
  // right now we have only etherscan implementation

  const res = await getGasPricesFromEtherscan(network);

  if (isError<GasData, GetGasErrors>(res)) {
    if (res.error === 'RateReached') {
      await asyncSleep(WAIT_INTERVAL);
      return await getGasPrices(network);
    }

    throw new Error(`Cant get has prices: ${res.error}`);
  }

  if (isSuccess<GasData, GetGasErrors>(res)) {
    return res.result;
  }

  throw new Error("This can't be");
};
