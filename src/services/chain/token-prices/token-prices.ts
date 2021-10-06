import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { add, divide, fromWei, multiply } from '@/utils/bigmath';
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
import { TransactionsParams } from '@/wallet/types';

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
      `error get MOVE price in WETH from SUSHISWAP MOVE-WETH pool: ${JSON.stringify(
        error
      )}`
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
    console.log('get USDC-ETH price...');
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
      `error get USDC price in WETH from UNISWAP USDC-WETH pool: ${JSON.stringify(
        error
      )}`
    );
  }
};

export const getSLPPriceInWETH = async (
  movePriceInWETH: string,
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet) {
    console.log(
      'get SLP price in WETH is disabled for not ethereum mainnet: ',
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

  const contractPool = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractSushiswapMOVEWETHPoolAddress
  );

  try {
    console.log('get SUSHI MOVE-WETH LP token price...');
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

    const poolTotalSupplyResponse = await contractPool.methods
      .totalSupply()
      .call(transactionParams);

    const poolTotalSupply = poolTotalSupplyResponse.toString();
    console.log('sushiswap MOVE-WETH pool, total supply: ', poolTotalSupply);

    const poolValueMoveInWETH = multiply(movePoolAmount, movePriceInWETH);
    console.log('poolValueMoveInWETH: ', poolValueMoveInWETH);

    const poolValueWETH = wethPoolAmount;
    console.log('poolValueWETH: ', poolValueWETH);

    const poolValue = add(poolValueMoveInWETH, poolValueWETH);

    const slpPriceInWETH = divide(poolValue, poolTotalSupply);

    if (isNaN(+slpPriceInWETH)) {
      return '0';
    }

    return slpPriceInWETH;
  } catch (error) {
    throw new Error(
      `error get MOVE-WETH LP token price in WETH from SUSHISWAP MOVE-WETH pool: ${JSON.stringify(
        error
      )}`
    );
  }
};
