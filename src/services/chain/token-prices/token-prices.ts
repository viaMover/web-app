import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { add, divide, fromWei, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  ERC20_ABI,
  getEURSAssetData,
  getUSDCAssetData,
  lookupAddress
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

  const contractAddressMOVE = lookupAddress(network, 'MOVE_ADDRESS');
  const contractAddressWETH = lookupAddress(network, 'WETH_TOKEN_ADDRESS');

  const contractSushiswapMOVEWETHPoolAddress = lookupAddress(
    network,
    'SUSHISWAP_MOVE_WETH_POOL_ADDRESS'
  );

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

export const getOlympusPriceInWETH = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet) {
    console.log(
      'get Olympus price in WETH is disabled for not ethereum mainnet: ',
      network
    );
    return '0';
  }

  const contractAddressOHM = lookupAddress(network, 'OHM_ADDRESS');
  const contractAddressWETH = lookupAddress(network, 'WETH_TOKEN_ADDRESS');

  const contractSushiswapOHMWETHPoolAddress = lookupAddress(
    network,
    'SUSHISWAP_MOVE_WETH_POOL_ADDRESS'
  );

  const contractOHM = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressOHM
  );

  const contractWETH = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressWETH
  );

  try {
    console.log('get OHM-WETH price...');
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const olympusPoolAmountResponse = await contractOHM.methods
      .balanceOf(contractSushiswapOHMWETHPoolAddress)
      .call(transactionParams);

    const olympusPoolAmount = olympusPoolAmountResponse.toString();
    console.log('sushiswap OHM-WETH pool, MOVE amount: ', olympusPoolAmount);

    const wethPoolAmountResponse = await contractWETH.methods
      .balanceOf(contractSushiswapOHMWETHPoolAddress)
      .call(transactionParams);

    const wethPoolAmount = wethPoolAmountResponse.toString();
    console.log('sushiswap OHM-WETH pool, WETH amount: ', wethPoolAmount);

    // IMPORTANT: we can divide WEI by WEI coz OHM has the same decimals as WETH
    const olympusPriceInWETH = divide(wethPoolAmount, olympusPoolAmount);
    console.log('olympusPriceInWETH: ', olympusPriceInWETH);

    return olympusPriceInWETH;
  } catch (error) {
    throw new Error(
      `error get OHM price in WETH from SUSHISWAP OHM-WETH pool: ${JSON.stringify(
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

  const contractAddressUSDC = lookupAddress(network, 'USDC_TOKEN_ADDRESS');
  const contractAddressWETH = lookupAddress(network, 'WETH_TOKEN_ADDRESS');

  const contractUniswapUSDCWETHPoolAddress = lookupAddress(
    network,
    'UNSIWAP_USDC_WETH_POOL_ADDRESS'
  );

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

export const getEURSPriceInWETH = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet) {
    console.log(
      'get EURS price in WETH is disabled for not ethereum mainnet: ',
      network
    );
    return '0';
  }

  const contractAddressEURS = lookupAddress(network, 'EURS_TOKEN_ADDRESS');
  const contractAddressWETH = lookupAddress(network, 'WETH_TOKEN_ADDRESS');

  const contractUniswapEURSWETHPoolAddress = lookupAddress(
    network,
    'UNISWAP_EURS_WETH_POOL_ADDRESS'
  );

  const contractEURS = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressEURS
  );

  const contractWETH = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    contractAddressWETH
  );

  try {
    console.log('get EURS-ETH price...');
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const eursPoolAmountResponse = await contractEURS.methods
      .balanceOf(contractUniswapEURSWETHPoolAddress)
      .call(transactionParams);

    const eursPoolAmountWEI = eursPoolAmountResponse.toString();
    const eursPoolAmount = fromWei(
      eursPoolAmountWEI,
      getEURSAssetData(network).decimals
    );

    console.log('uniswap EURS-WETH pool, EUR amount: ', eursPoolAmount);

    const wethPoolAmountResponse = await contractWETH.methods
      .balanceOf(contractUniswapEURSWETHPoolAddress)
      .call(transactionParams);

    const wethPoolAmountInWEI = wethPoolAmountResponse.toString();
    const wethPoolAmount = fromWei(wethPoolAmountInWEI, 18);
    console.log('uniswap EURS-WETH pool, WETH amount: ', wethPoolAmount);

    const EURSPriceInWETH = divide(wethPoolAmount, eursPoolAmount);
    console.log('EursPriceInWETH: ', EURSPriceInWETH);

    return EURSPriceInWETH;
  } catch (error) {
    throw new Error(
      `error get EURS price in WETH from UNISWAP EURS-WETH pool: ${JSON.stringify(
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

  const contractAddressMOVE = lookupAddress(network, 'MOVE_ADDRESS');
  const contractAddressWETH = lookupAddress(network, 'WETH_TOKEN_ADDRESS');

  const contractSushiswapMOVEWETHPoolAddress = lookupAddress(
    network,
    'SUSHISWAP_MOVE_WETH_POOL_ADDRESS'
  );

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
