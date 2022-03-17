import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { isBaseAsset } from '@/utils/address';
import { fromWei, greaterThan } from '@/utils/bigmath';
import { ERC20_ABI } from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

const getAllowance = async (
  owner: string,
  tokenAddress: string,
  spender: string,
  web3: Web3
): Promise<string> => {
  try {
    const transactionParams = {
      from: spender
    } as TransactionsParams;

    const tokenContract = new web3.eth.Contract(
      ERC20_ABI as AbiItem[],
      tokenAddress
    );
    const allowance = await tokenContract.methods
      .allowance(owner, spender)
      .call(transactionParams);
    return allowance.toString();
  } catch (error) {
    throw new Error(`can't ger allowance for token: ${tokenAddress}: ${error}`);
  }
};

export const needApprove = async (
  accountAddress: string,
  token: SmallToken,
  amountToApprove: string,
  contractAddress: string,
  web3: Web3
): Promise<boolean> => {
  console.log(
    `checking asset needs unlocking: ${token.symbol} - ${token.address}`
  );
  // fixme: add network later on
  if (isBaseAsset(token.address)) {
    console.log("Eth doesn't need unlocking");
    return false;
  }

  const allowance = await getAllowance(
    accountAddress,
    token.address,
    contractAddress,
    web3
  );

  const rawAmount = fromWei(amountToApprove, token.decimals);
  const assetNeedsApprove = !greaterThan(allowance, rawAmount);
  console.log('asset needs approve?', assetNeedsApprove);
  return assetNeedsApprove;
};
