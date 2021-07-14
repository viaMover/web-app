import { AbiItem } from 'web3-utils';
import { Network } from '@/utils/networkTypes';
import {
  ERC20_ABI,
  getUSDCAssetData,
  MOVE_ADDRESS,
  SUSHISWAP_MOVE_WETH_POOL_ADDRESS,
  UNISWAP_USDC_WETH_POOL_ADDRESS,
  USDC_TOKEN_ADDRESS,
  WETH_TOKEN_ADDRESS
} from '@/wallet/references/data';
import Web3 from 'web3';
import { TransactionsParams } from '@/wallet/types';
import { divide, fromWei } from '@/utils/bigmath';

export const getMOVEPriceInWETH = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet) {
    console.log(
      'get MOVE price in WETH is disabled for not ethereum mainnet: ',
      network
    );
    return '0';
  }

  const contractAddressMOVE = MOVE_ADDRESS(network);
  const contractAddressWETH = WETH_TOKEN_ADDRESS(network);

  const contractSushiswapMOVEWETHPoolAddress =
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS(network);

  const contractMOVE = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressMOVE
  );

  const contractWETH = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressWETH
  );

  try {
    console.log('get MOVE-WETH price...');
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const movePoolAmountResponse = await contractMOVE.methods
      .balanceOf(contractSushiswapMOVEWETHPoolAddress)
      .call(transactionParams);

    const movePoolAmount = movePoolAmountResponse.toString();
    console.log('sushiswap MOVE-WETH pool, MOVE amount: ', movePoolAmount);

    const wethPoolAmountResponse = await contractWETH.methods
      .balanceOf(contractSushiswapMOVEWETHPoolAddress)
      .call(transactionParams);

    const wethPoolAmount = wethPoolAmountResponse.toString();
    console.log('sushiswap MOVE-WETH pool, WETH amount: ', wethPoolAmount);

    // IMPORTANT: we can divide WEI by WEI coz MOVE has the same decimals as WETH
    const MovePriceInWETH = divide(wethPoolAmount, movePoolAmount);
    console.log('MovePriceInWETH: ', MovePriceInWETH);

    return MovePriceInWETH;
  } catch (error) {
    throw new Error(
      `error get MOVE price in WETH from SUSHISWAP MOVE-WETH pool: ${error}`
    );
  }
};

export const getUSDCPriceInWETH = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet) {
    console.log(
      'get USDC price in WETH is disabled for not ethereum mainnet: ',
      network
    );
    return '0';
  }

  const contractAddressUSDC = USDC_TOKEN_ADDRESS(network);
  const contractAddressWETH = WETH_TOKEN_ADDRESS(network);

  const contractUniswapUSDCWETHPoolAddress =
    UNISWAP_USDC_WETH_POOL_ADDRESS(network);

  const contractUSDC = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressUSDC
  );

  const contractWETH = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressWETH
  );

  try {
    console.log('get MOVE-ETH price...');
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const usdcPoolAmountResponse = await contractUSDC.methods
      .balanceOf(contractUniswapUSDCWETHPoolAddress)
      .call(transactionParams);

    const usdcPoolAmountWEI = usdcPoolAmountResponse.toString();
    const usdcPoolAmount = fromWei(
      usdcPoolAmountWEI,
      getUSDCAssetData(network).decimals
    );

    console.log('uniswap USDC-WETH pool, USDC amount: ', usdcPoolAmount);

    const wethPoolAmountResponse = await contractWETH.methods
      .balanceOf(contractUniswapUSDCWETHPoolAddress)
      .call(transactionParams);

    const wethPoolAmountInWEI = wethPoolAmountResponse.toString();
    const wethPoolAmount = fromWei(wethPoolAmountInWEI, 18);
    console.log('uniswap USDC-WETH pool, WETH amount: ', wethPoolAmount);

    const UsdcPriceInWETH = divide(wethPoolAmount, usdcPoolAmount);
    console.log('UsdcPriceInWETH: ', UsdcPriceInWETH);

    return UsdcPriceInWETH;
  } catch (error) {
    throw new Error(
      `error get USDC price in WETH from UNISWAP USDC-WETH pool: ${error}`
    );
  }
};
