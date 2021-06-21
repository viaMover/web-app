import { MAXUINT256 } from '@/utils/consts';
import { ERC20_ABI } from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

export const estimateApprove = async (
  accountAddress: string,
  tokenAddress: string,
  spenderAddress: string,
  web3: Web3
): Promise<string> => {
  const tokenContract = new web3.eth.Contract(
    ERC20_ABI as AbiItem[],
    tokenAddress
  );
  try {
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const gasLimit = await tokenContract.methods
      .approve(spenderAddress, MAXUINT256)
      .estimateGas(transactionParams);

    if (gasLimit) {
      return gasLimit.toString();
    }
    throw new Error(`empty gas limit`);
  } catch (error) {
    throw new Error(
      `can't estimate approve for token ${tokenAddress}: ${error}}`
    );
  }
};
