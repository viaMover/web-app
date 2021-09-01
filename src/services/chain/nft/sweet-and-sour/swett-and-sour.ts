import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { TransactionsParams } from '@/wallet/types';
import { SweetAndSourData } from './types';
import { Network } from '@/utils/networkTypes';
import {
  NFT_SWEET_AND_SOUR_ABI,
  NFT_SWEET_AND_SOUR_ADDRESS
} from '@/wallet/references/data';

export const getSweetAndSourData = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<SweetAndSourData> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const contractAddress = NFT_SWEET_AND_SOUR_ADDRESS(network);

  const sweetAndSour = new web3.eth.Contract(
    NFT_SWEET_AND_SOUR_ABI as AbiItem[],
    contractAddress
  );

  const totalAmount = await sweetAndSour.methods
    ._claimLimit()
    .call(transactionParams);

  const totalClaimed = await sweetAndSour.methods
    ._totalClaimed()
    .call(transactionParams);

  return {
    totalAmount: totalAmount.toString(),
    totalClaimed: totalClaimed.toString()
  };
};
