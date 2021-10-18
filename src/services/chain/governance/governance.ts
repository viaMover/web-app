import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { add, divide, fromWei, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  ERC20_ABI,
  MASTER_CHEF_ABI,
  MASTER_CHEF_ADDRESS,
  MASTER_CHEF_POOL_INDEX,
  MOVE_ADDRESS,
  SMART_TREASURY_ABI,
  SMART_TREASURY_ADDRESS,
  SUSHI_UNI_PAIR_V2_ABI,
  SUSHISWAP_MOVE_WETH_POOL_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const getVotingPower = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  snapshot?: number
): Promise<string> => {
  const transactionParams: TransactionsParams = {
    from: accountAddress
  };

  const moveTokenContract = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    MOVE_ADDRESS(network)
  );
  const smartTreasuryContract = new web3.eth.Contract(
    SMART_TREASURY_ABI as AbiItem[],
    SMART_TREASURY_ADDRESS(network)
  );
  const sushiPoolAddress = SUSHISWAP_MOVE_WETH_POOL_ADDRESS(network);
  const sushiPoolContract = new web3.eth.Contract(
    SUSHI_UNI_PAIR_V2_ABI as AbiItem[],
    sushiPoolAddress
  );
  const masterChefContract = new web3.eth.Contract(
    MASTER_CHEF_ABI as AbiItem[],
    MASTER_CHEF_ADDRESS(network)
  );

  // account balance of MOVE
  const moveBalanceInWei = await moveTokenContract.methods
    .balanceOf(accountAddress)
    .call(transactionParams, snapshot);
  const moveBalance = fromWei(moveBalanceInWei, 18);

  // smart treasury balance of MOVE
  const smartTreasuryMoveBalanceInWei = await smartTreasuryContract.methods
    .userInfoMove(accountAddress)
    .call(transactionParams, snapshot);
  const smartTreasuryMoveBalance = fromWei(smartTreasuryMoveBalanceInWei, 18);

  // smart treasury balance of MOVE SLP
  const smartTreasuryMoveSlpBalanceInWei = await smartTreasuryContract.methods
    .userInfoMoveLP(accountAddress)
    .call(transactionParams, snapshot);
  const smartTreasuryMoveSlpBalance = fromWei(
    smartTreasuryMoveSlpBalanceInWei,
    18
  );

  // amount MOVE per MOVE SLP on SUSHI
  const moveOnSushiPoolContractInWei = await moveTokenContract.methods
    .balanceOf(sushiPoolAddress)
    .call(transactionParams, snapshot);
  const sushiPoolTotalSupplyInWei = await sushiPoolContract.methods
    .totalSupply()
    .call(transactionParams, snapshot);
  const movePerSlp = divide(
    moveOnSushiPoolContractInWei,
    sushiPoolTotalSupplyInWei
  );

  // sushi pool balance of MOVE SLP
  const sushiPoolBalanceInWei = await sushiPoolContract.methods
    .balanceOf(accountAddress)
    .call(transactionParams, snapshot);
  const sushiPoolBalance = fromWei(sushiPoolBalanceInWei, 18);

  // master chef pool balance of MOVE SLP
  const masterChefPoolIndex = MASTER_CHEF_POOL_INDEX(network);
  const masterChefUserInfoMovePool = await masterChefContract.methods
    .userInfo(masterChefPoolIndex, accountAddress)
    .call(transactionParams, snapshot);
  const masterChefBalanceInWei =
    masterChefUserInfoMovePool.amount ?? masterChefUserInfoMovePool[0];
  const masterChefBalance = fromWei(masterChefBalanceInWei, 18);

  // sum of all MOVE from different sources
  const movePart = add(moveBalance, smartTreasuryMoveBalance);

  // MOVE SLP weight multiplier
  const slpMultiplier = multiply(2.5, movePerSlp);

  // sum of all MOVE SLP from different sources
  const moveSlpPartWithoutMultiplier = add(
    sushiPoolBalance,
    add(smartTreasuryMoveSlpBalance, masterChefBalance)
  );

  // MOVE SLP part with weight multiplier
  const moveSlpPart = multiply(slpMultiplier, moveSlpPartWithoutMultiplier);

  return add(movePart, moveSlpPart);
};

export const getCommunityVotingPower = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  snapshot?: number
): Promise<string> => {
  const transactionParams: TransactionsParams = {
    from: accountAddress
  };

  const moveTokenContract = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    MOVE_ADDRESS(network)
  );
  const sushiPoolContract = new web3.eth.Contract(
    SUSHI_UNI_PAIR_V2_ABI as AbiItem[],
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS(network)
  );

  const moveTotalSupplyInWei = await moveTokenContract.methods
    .totalSupply()
    .call(transactionParams, snapshot);
  const moveTotalSupply = fromWei(moveTotalSupplyInWei, 18);

  const sushiReservesInWei = await sushiPoolContract.methods
    .getReserves()
    .call(transactionParams, snapshot);
  const sushiReserveMovePartInWei =
    sushiReservesInWei._reserve0 ?? sushiReservesInWei[0];
  const sushiReserveMovePart = fromWei(sushiReserveMovePartInWei, 18);

  return add(moveTotalSupply, multiply(sushiReserveMovePart, 1.5));
};
