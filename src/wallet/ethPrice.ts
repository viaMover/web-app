import { getEthPrice as getEthPriceFromCoingecko } from '@/services/coingecko/tokens';
import { getEthPrice as getEthPriceFromEtherscan } from '@/services/etherscan/ethPrice';
import { Network } from '@/utils/networkTypes';
import { currentTimestamp } from '@/utils/time';

const localStorageEthereumKey = 'ETH_USD_PRICE';

type ethPriceData = {
  usdPrice: string;
  updateAt: number;
};

export const getEthereumPrice = async (network: Network): Promise<string> => {
  console.info('Trying to get eth price from local storage... ');
  const data = localStorage.getItem(localStorageEthereumKey);
  if (data !== null) {
    const ethData = JSON.parse(data) as ethPriceData;
    if (ethData.updateAt > currentTimestamp() - 60 * 60 * 2) {
      console.info('Eth price from local storage:', ethData.usdPrice);

      return ethData.usdPrice;
    }
    console.info('Eth price in local storage expired');
  }
  console.info('There is no Eth price in local storage');

  const ethPriceInUSDEtherscanResult = await getEthPriceFromEtherscan(network);
  if (ethPriceInUSDEtherscanResult.isError) {
    console.info(
      `Can't get ethereum price from Etherscan: ${ethPriceInUSDEtherscanResult.error}`
    );
    const ethPriceInUSDCoongeckoResult = await getEthPriceFromCoingecko();
    if (ethPriceInUSDCoongeckoResult.isError) {
      console.info(
        `Can't get ethereum price from coingecko: ${ethPriceInUSDCoongeckoResult.error}`
      );
      throw new Error(
        `Can't get ethereum price: ${ethPriceInUSDCoongeckoResult.isError}`
      );
    }
    console.log(
      'Eth price from Coingecko: ',
      ethPriceInUSDCoongeckoResult.result
    );
    localStorage.setItem(
      localStorageEthereumKey,
      JSON.stringify({
        usdPrice: ethPriceInUSDCoongeckoResult.result,
        updateAt: currentTimestamp()
      } as ethPriceData)
    );
    return ethPriceInUSDCoongeckoResult.result;
  }
  console.log(
    'Eth price from Etherscan: ',
    ethPriceInUSDEtherscanResult.result
  );
  localStorage.setItem(
    localStorageEthereumKey,
    JSON.stringify({
      usdPrice: ethPriceInUSDEtherscanResult.result,
      updateAt: currentTimestamp()
    } as ethPriceData)
  );
  return ethPriceInUSDEtherscanResult.result;
};
