import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { greaterThan } from '@/utils/bigmath';
import { ERC721_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const checkIsNftPresent = async (
  web3: Web3,
  accountAddress: string,
  nftAddress: string
): Promise<boolean> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const nftContract = new web3.eth.Contract(
    ERC721_ABI as AbiItem[],
    nftAddress
  );

  const balanceOf = await nftContract.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  return greaterThan(balanceOf, 0);
};
