import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { convertToString, greaterThan } from '@/utils/bigmath';
import { ERC20_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const currentBalance = async (
  web3: Web3,
  accountAddress: string,
  assetAddress: string
): Promise<string> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const сontract = new web3.eth.Contract(ERC20_ABI as AbiItem[], assetAddress);

  const balanceOf = await сontract.methods
    .balanceOf(accountAddress)
    .call(transactionParams);

  return convertToString(balanceOf);
};
