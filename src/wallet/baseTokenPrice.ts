import { getNetworkBaseTokenPrice } from '@/services/coingecko/tokens';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';

const localStorageEthereumKey = 'USD_PRICE';

type BaseTokenPriceData = {
  network: Network;
  usdPrice: string;
  updateAt: number;
};

export const getBaseTokenPrice = async (network: Network): Promise<string> => {
  console.info(
    `Trying to get base token price from local storage (${network})... `
  );
  const data = localStorage.getItem(storageKey(network));
  if (data !== null) {
    const baseTokenData = JSON.parse(data) as BaseTokenPriceData;
    if (
      baseTokenData.updateAt > currentTimestamp() - 60 * 60 * 2 &&
      baseTokenData.network === network
    ) {
      console.info(
        `Base token (${network}) price from local storage:`,
        baseTokenData.usdPrice
      );

      return baseTokenData.usdPrice;
    }
    console.info(`Base token (${network}) price in local storage expired`);
  }
  console.info(`There is no base token (${network}) price in local storage`);

  const baseTokenPriceInUSDCoingeckoResult = await getNetworkBaseTokenPrice(
    network
  );
  if (baseTokenPriceInUSDCoingeckoResult.isError) {
    console.info(
      `Can't get base token price from coingecko: ${baseTokenPriceInUSDCoingeckoResult.error}`
    );
    throw new Error(
      `Can't get base token price: ${baseTokenPriceInUSDCoingeckoResult.isError}`
    );
  }
  console.log(
    'Base token price from Coingecko: ',
    baseTokenPriceInUSDCoingeckoResult.result
  );
  localStorage.setItem(
    storageKey(network),
    JSON.stringify({
      usdPrice: baseTokenPriceInUSDCoingeckoResult.result,
      updateAt: currentTimestamp(),
      network: network
    } as BaseTokenPriceData)
  );
  return baseTokenPriceInUSDCoingeckoResult.result;
};

const storageKey = (network: Network): string => {
  return `${network}_${localStorageEthereumKey}`;
};
