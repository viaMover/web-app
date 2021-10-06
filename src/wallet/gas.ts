import { isError, isSuccess } from '@/services/responses';
import { Network } from '@/utils/networkTypes';
import { getGasPrices as getGasPricesFromEtherscan } from './../services/etherscan/gas';
import { GasData } from './types';
import { getGasPrices as getGasPricesFromGasStation } from './../services/gasstation/gas';

export type GetGasErrors = 'RateReached' | 'NoEndpointForNetwork' | string;

export const getGasPrices = async (
  network = Network.mainnet
): Promise<GasData> => {
  console.log('Getting new gas prices from etherscan...');
  // right now we have only etherscan implementation

  const res = await getGasPricesFromEtherscan(network);

  if (isError<GasData, GetGasErrors>(res)) {
    console.error(
      `Can't load gas prices from Etherscan: ${res.error}, trying another source...`
    );

    try {
      return getGasPricesFromGasStation();
    } catch (err) {
      console.error("Can't load gas prices from Gas Station");
      throw new Error("Can't load gas price from all sources");
    }
  }

  if (isSuccess<GasData, GetGasErrors>(res)) {
    return res.result;
  }

  throw new Error("This can't be");
};
