import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { add, divide, fromWei, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  ERC20_ABI,
  lookupAddress,
  lookupConstant,
  MASTER_CHEF_ABI,
  SMART_TREASURY_ABI,
  SUSHI_UNI_PAIR_V2_ABI
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
    lookupAddress(network, 'MOVE_ADDRESS')
  );
  const smartTreasuryContract = new web3.eth.Contract(
    SMART_TREASURY_ABI as AbiItem[],
    lookupAddress(network, 'SMART_TREASURY_ADDRESS')
  );
  const sushiPoolAddress = lookupAddress(
    network,
    'SUSHISWAP_MOVE_WETH_POOL_ADDRESS'
  );
  const sushiPoolContract = new web3.eth.Contract(
    SUSHI_UNI_PAIR_V2_ABI as AbiItem[],
    sushiPoolAddress
  );
  const masterChefContract = new web3.eth.Contract(
    MASTER_CHEF_ABI as AbiItem[],
    lookupAddress(network, 'MASTER_CHEF_ADDRESS')
  );

  // account balance of MOVE
  const moveBalanceInWei = await moveTokenContract.methods
    .balanceOf(accountAddress)
    .call(transactionParams, snapshot);
  const moveBalance = fromWei(moveBalanceInWei, 18);

  // smart treasury balance of MOVE
  const smartTreasuryMoveBalanceResponse = await smartTreasuryContract.methods
    .userInfoMove(accountAddress)
    .call(transactionParams, snapshot);
  const smartTreasuryMoveBalanceInWei =
    smartTreasuryMoveBalanceResponse.amount ??
    smartTreasuryMoveBalanceResponse[0];
  const smartTreasuryMoveBalance = fromWei(smartTreasuryMoveBalanceInWei, 18);

  // smart treasury balance of MOVE SLP
  const smartTreasuryMoveSlpBalanceResponse =
    await smartTreasuryContract.methods
      .userInfoMoveLP(accountAddress)
      .call(transactionParams, snapshot);
  const smartTreasuryMoveSlpBalanceInWei =
    smartTreasuryMoveSlpBalanceResponse.amount ??
    smartTreasuryMoveSlpBalanceResponse[0];
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
  const masterChefPoolIndex = lookupConstant(network, 'MASTER_CHEF_POOL_INDEX');
  if (masterChefPoolIndex === undefined) {
    throw new Error('Governance is disabled in this network');
  }

  const masterChefUserInfoMovePool = await masterChefContract.methods
    .userInfo(masterChefPoolIndex, accountAddress)
    .call(transactionParams, snapshot);
  const masterChefBalanceInWei =
    masterChefUserInfoMovePool.amount ?? masterChefUserInfoMovePool[0];
  const masterChefBalance = fromWei(masterChefBalanceInWei, 18);

  // sum of all MOVE from different sources
  const movePart = add(moveBalance, smartTreasuryMoveBalance);

  // MOVE SLP weight multiplier (2.5)
  const slpMultiplier = divide(multiply(5, movePerSlp), 2);

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
    lookupAddress(network, 'MOVE_ADDRESS')
  );
  const sushiPoolContract = new web3.eth.Contract(
    SUSHI_UNI_PAIR_V2_ABI as AbiItem[],
    lookupAddress(network, 'SUSHISWAP_MOVE_WETH_POOL_ADDRESS')
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

  return add(moveTotalSupply, divide(multiply(sushiReserveMovePart, 3), 2));
};
