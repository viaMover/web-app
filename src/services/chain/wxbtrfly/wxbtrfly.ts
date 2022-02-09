import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { convertToString } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  WX_BTRFLY_ABI,
  WX_BTRFLY_TOKEN_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const getRealIndex = async (
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<string> => {
  const transactionParams = {
    from: accountAddress
  } as TransactionsParams;

  const сontract = new web3.eth.Contract(
    WX_BTRFLY_ABI as AbiItem[],
    WX_BTRFLY_TOKEN_ADDRESS(network)
  );

  const realIndex = await сontract.methods.realIndex().call(transactionParams);

  return convertToString(realIndex);
};
