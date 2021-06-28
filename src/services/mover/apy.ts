import { AbiItem } from 'web3-utils';
import { Network } from '@/utils/networkTypes';
import {
  HOLY_POOL_ABI,
  HOLY_SAVINGS_POOL_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';
import Web3 from 'web3';
import { fromWei, multiply } from '@/utils/bigmath';

export type GetSavingsAPYReturn = {
  apy: string;
  dpy: string;
};

export const GetSavingsApy = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<GetSavingsAPYReturn> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const holyPoolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

  const HolyHand = new web3.eth.Contract(
    HOLY_POOL_ABI as AbiItem[],
    holyPoolAddress
  );

  const savingsDPYinWEI = await HolyHand.methods
    .getDailyAPY()
    .call(transactionParams);

  const savingsDPY = fromWei(savingsDPYinWEI, 18);
  const savingsAPY = multiply(savingsDPY, 365);
  return {
    apy: savingsAPY,
    dpy: savingsDPY
  };
};
