import Web3 from 'web3';
import { Network } from '@/utils/networkTypes';
import { TransactionsParams } from '@/wallet/types';
import {
  MOVE_ADDRESS,
  ERC20_ABI,
  SUSHISWAP_MOVE_WETH_POOL_ADDRESS,
  SUSHI_UNI_PAIR_V2_ABI
} from '@/wallet/references/data';
import { AbiItem } from 'web3-utils';
import { add, fromWei, multiply } from '@/utils/bigmath';

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
  const sushiReserveMovePart = fromWei(sushiReservesInWei._reserve0, 18);

  return add(moveTotalSupply, multiply(sushiReserveMovePart, '1.5'));
};
