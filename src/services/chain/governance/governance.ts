import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { add, fromWei, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  ERC20_ABI,
  MOVE_ADDRESS,
  SUSHI_UNI_PAIR_V2_ABI,
  SUSHISWAP_MOVE_WETH_POOL_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const getCommunityVotingPower = async (
  accountAddress: string,
  network: Network,
  web3: Web3,
  snapshot?: number
): Promise<string> => {
  const transactionParams: TransactionsParams = {
    from: accountAddress
  };

  const moveTokenAddress = MOVE_ADDRESS(network);
  const moveToken = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    moveTokenAddress
  );
  const moveTotalSupplyInWei = await moveToken.methods
    .totalSupply()
    .call(transactionParams, snapshot);

  const sushiPoolAddress = SUSHISWAP_MOVE_WETH_POOL_ADDRESS(network);
  const sushiPool = new web3.eth.Contract(
    SUSHI_UNI_PAIR_V2_ABI as AbiItem[],
    sushiPoolAddress
  );
  const sushiReservesInWei = await sushiPool.methods
    .getReserves()
    .call(transactionParams, snapshot);

  const moveTotalSupply = fromWei(moveTotalSupplyInWei, 18);
  const sushiReserveMovePartInWei =
    sushiReservesInWei._reserve0 ?? sushiReservesInWei[0];
  const sushiReserveMovePart = fromWei(sushiReserveMovePartInWei, 18);

  return add(moveTotalSupply, multiply(sushiReserveMovePart, '1.5'));
};
