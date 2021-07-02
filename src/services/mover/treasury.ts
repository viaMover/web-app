import { BigNumber } from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import { Network } from '@/utils/networkTypes';
import {
  getMoveAssetData,
  getUSDCAssetData,
  SMART_TREASURY_ABI,
  SMART_TREASURY_ADDRESS
} from '@/wallet/references/data';
import Web3 from 'web3';
import { TransactionsParams } from '@/wallet/types';
import { divide, isFinite, isNaN, toWei, fromWei } from '@/utils/bigmath';

export type TreasuryBalancesReturn = {
  MoveBalance: string;
  LPBalance: string;
};

export const getTreasuryBalance = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<TreasuryBalancesReturn> => {
  if (network !== Network.mainnet && network !== Network.kovan) {
    console.log(
      'smart treasury balances is disabled for not ethereum mainnet or kovan: ',
      network
    );
    return {
      LPBalance: '0',
      MoveBalance: '0'
    };
  }

  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  const smartTreasury = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  const ret: TreasuryBalancesReturn = {
    LPBalance: '0',
    MoveBalance: '0'
  };

  try {
    console.log('get smart treasury MOVE balance for user...');
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const userInfoMoveResponse = await smartTreasury.methods
      .userInfoMove(accountAddress)
      .call(transactionParams);

    let moveBalance = userInfoMoveResponse[0];
    console.log('smart treasury: moveBalance in WEI: ', moveBalance);
    moveBalance = new BigNumber(moveBalance.toString());
    moveBalance = moveBalance
      .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
      .toFixed();
    console.log('smart treasury: moveBalance: ', moveBalance);

    ret.MoveBalance = moveBalance;
  } catch (error) {
    throw new Error(`error getting smart treasury MOVE balance: ${error}`);
  }

  try {
    console.log('get smart treasury LP balance for user...');

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const userInfoMoveEthLPResponse = await smartTreasury.methods
      .userInfoMoveEthLP(accountAddress)
      .call(transactionParams);

    let moveEthLPBalance = userInfoMoveEthLPResponse[0];

    console.log('smart treasury: moveEthLPBalance in WEI: ', moveEthLPBalance);
    moveEthLPBalance = new BigNumber(moveEthLPBalance.toString());
    moveEthLPBalance = moveEthLPBalance
      .dividedBy(new BigNumber(10).pow(new BigNumber(18)))
      .toFixed();
    console.log('smart treasury: moveEthLPBalance: ', moveEthLPBalance);

    ret.LPBalance = moveEthLPBalance;
  } catch (error) {
    throw new Error(`error get smart treasury LP balance: ${error}`);
  }

  return ret;
};

export const GetTreasuryBonus = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet && network !== Network.kovan) {
    console.log(
      'smart treasury bonus is disabled for not ethereum mainnet or kovan: ',
      network
    );
    return '0';
  }

  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  const smartTreasury = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  try {
    console.log("get smart treasury user's total bonus...");

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const smBonusResponse = await smartTreasury.methods
      .totalBonus(accountAddress)
      .call(transactionParams);

    console.log(
      'smart treasury: total bonus in WEI (decimals = 6): ',
      smBonusResponse
    );
    const smBonus = new BigNumber(smBonusResponse.toString())
      .dividedBy(new BigNumber(10).pow(new BigNumber(6)))
      .toFixed();

    console.log('smart treasury: total bonus: ', smBonus);

    return smBonus;
  } catch (error) {
    throw new Error(`error get smart treasury total bonus: ${error}`);
  }
};

export const getTreasuryAPY = async (
  usdcNativePrice: string,
  moveNativePrice: string,
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet && network !== Network.kovan) {
    console.log(
      'smart treasury APY is disabled for not ethereum mainnet or kovan: ',
      network
    );
    return '0';
  }

  console.log(
    'get smart treasury with USDC native price:',
    usdcNativePrice,
    'and MOVE native price:',
    moveNativePrice
  );

  const movePriceInUSDC = divide(moveNativePrice, usdcNativePrice);
  console.log('smart treasury: movePriceInUSDC: ', movePriceInUSDC);

  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  const smartTreasury = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  try {
    console.log('get smart treasury APY...');

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const apyInUSDcResponse = await smartTreasury.methods
      .getDPYPerMoveToken()
      .call(transactionParams);

    const apyInUSDc = apyInUSDcResponse.toString();
    console.log('smart treasury: treasury APY in USDC for 1 MOVE: ', apyInUSDc);

    let apy = divide(apyInUSDc, movePriceInUSDC);
    if (isNaN(apy) || !isFinite(apy)) {
      apy = '0';
    }

    apy = fromWei(apy, 18);
    console.log('smart treasury: APY in %: ', apy);

    return apy;
  } catch (error) {
    throw new Error(`error get smart treasury APY: ${error}`);
  }
};

export const getMaxBurn = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet && network !== Network.kovan) {
    console.log(
      'smart treasury max burn amount is disabled for not ethereum mainnet and kovan: ',
      network
    );
    return '0';
  }

  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  const smartTreasury = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  try {
    console.log('get smart treasury max burn amount...');

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const maxBurnAmountInWEIResponse = await smartTreasury.methods
      .maxBurnAmount()
      .call(transactionParams);

    const maxBurnAmountInWEI = maxBurnAmountInWEIResponse.toString();
    console.log('maxBurnAmountInWEI: ', maxBurnAmountInWEI);
    const maxBurnAmount = fromWei(maxBurnAmountInWEI, '18');
    console.log('maxBurnAmount: ', maxBurnAmount);
    return maxBurnAmount;
  } catch (error) {
    throw new Error(`error get smart treasury max burn amount: ${error}`);
  }
};

export const getExitingAmount = async (
  accountAddress: string,
  toBurnAmount: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet && network !== Network.kovan) {
    console.log(
      'smart treasury exiting amount is disabled for not ethereum mainnet and kovan: ',
      network
    );
    return '0';
  }

  if (toBurnAmount === '0') {
    return '0';
  }

  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  const smartTreasury = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  try {
    console.log('get smart exiting burn amount...');

    const toBurnAmountInWEI = toWei(
      toBurnAmount,
      getMoveAssetData(network).decimals
    );
    console.log('toBurnAmountInWEI: ', toBurnAmountInWEI);

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const exitingAmountInWeiResponse = await smartTreasury.methods
      .getBurnValue(accountAddress, toBurnAmountInWEI)
      .call(transactionParams);

    const exitingAmountInWei = exitingAmountInWeiResponse.toString();
    console.log('exitingAmountInWei: ', exitingAmountInWei);

    const exitingAmount = fromWei(
      exitingAmountInWei,
      getUSDCAssetData(network).decimals
    );
    console.log('exitingAmount: ', exitingAmount);

    return exitingAmount;
  } catch (error) {
    throw new Error(`error get smart treasury exiting amount: ${error}`);
  }
};
