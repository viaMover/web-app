import { getBaseTokenPrices } from '@/services/coingecko/tokens';
import { mapToObj, ObjToMap } from '@/utils/map';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';

const localStorageEthereumKey = 'USD_PRICE';

type BaseTokenPriceData = {
  prices: Record<string, string>;
  updateAt: number;
};

export const getBaseTokenPrice = async (
  networks: Array<Network>
): Promise<Map<Network, string>> => {
  console.info(
    `Trying to get base token prices from local storage (${networks})... `
  );
  const data = localStorage.getItem(localStorageEthereumKey);
  if (data !== null) {
    const baseTokenData = JSON.parse(data) as BaseTokenPriceData;
    const savedNetworks = Object.keys(baseTokenData.prices);
    const notSavedNetwork = networks.find((n) => !savedNetworks.includes(n));
    if (notSavedNetwork === undefined) {
      if (baseTokenData.updateAt > currentTimestamp() - 60 * 60 * 2) {
        console.info(
          `Get base tokens (${networks}) price from local storage:`,
          baseTokenData.prices
        );

        return ObjToMap(baseTokenData.prices, networks);
      }
      console.info(`Base tokens (${networks}) prices in local storage expired`);
    } else {
      console.info(
        `There is no base token (${notSavedNetwork}) price in local storage`
      );
    }
  } else {
    console.info(
      `There is no base tokens (${networks}) prices in local storage`
    );
  }

  const baseTokensPricesInUSDCoingeckoResult = await getBaseTokenPrices(
    networks
  );
  if (baseTokensPricesInUSDCoingeckoResult.isError) {
    console.info(
      `Can't get base tokens prices from coingecko: ${baseTokensPricesInUSDCoingeckoResult.error}`
    );
    throw new Error(
      `Can't get base tokens prices: ${baseTokensPricesInUSDCoingeckoResult.isError}`
    );
  }
  console.log(
    'Base tokens prices from Coingecko: ',
    baseTokensPricesInUSDCoingeckoResult.result
  );
  localStorage.setItem(
    localStorageEthereumKey,
    JSON.stringify({
      prices: mapToObj(baseTokensPricesInUSDCoingeckoResult.result),
      updateAt: currentTimestamp()
    } as BaseTokenPriceData)
  );
  return baseTokensPricesInUSDCoingeckoResult.result;
};
