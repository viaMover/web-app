import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { TransactionsParams } from '@/wallet/types';
import { Network } from '@/utils/networkTypes';
import {
  NFT_UNEXPECTED_MOVE_ABI,
  NFT_UNEXPECTED_MOVE_ADDRESS
} from '@/wallet/references/data';
import { sub } from '@/utils/bigmath';
import { UnexpectedMoveData } from './types';

export const getUnexpectedMoveData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<UnexpectedMoveData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = NFT_UNEXPECTED_MOVE_ADDRESS(network);

  const unexpectedMove = new web3.eth.Contract(
    NFT_UNEXPECTED_MOVE_ABI as AbiItem[],
    contractAddress
  );

  const totalAmount = await unexpectedMove.methods
    ._claimLimit()
    .call(transactionParams);

  const totalClaimed = await unexpectedMove.methods
    ._totalClaimed()
    .call(transactionParams);

  const totalSupply = await unexpectedMove.methods
    .totalSupply()
    .call(transactionParams);

  return {
    totalAmount: totalAmount.toString(),
    totalClaimed: totalClaimed.toString(),
    totalExchanged: sub(totalClaimed.toString(), totalSupply.toString())
  };
};
