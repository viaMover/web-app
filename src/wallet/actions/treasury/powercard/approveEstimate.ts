import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { Network } from '@/utils/networkTypes';
import { NFT_RARI_ABI, POWERCARD_ADDRESS } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const estimatePowercardApprove = async (
  contractAddress: string,
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  const powercardRariAddress = POWERCARD_ADDRESS(network);
  const powercardRariABI = NFT_RARI_ABI;

  const rari = new web3.eth.Contract(
    powercardRariABI as AbiItem[],
    powercardRariAddress
  );
  try {
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const gasLimit = await rari.methods
      .setApprovalForAll(contractAddress, true)
      .estimateGas(transactionParams);

    if (gasLimit) {
      return gasLimit.toString();
    }
    throw new Error(`empty gas limit`);
  } catch (error) {
    throw new Error(`can't estimate approve powercard: ${error}}`);
  }
};
