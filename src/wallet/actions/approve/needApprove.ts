import { fromWei, greaterThan } from './../../../utils/bigmath';
import { isEth } from './../../../utils/address';
import { AbiItem } from 'web3-utils';
import { ERC20_ABI } from '@/wallet/references/data';
import Web3 from 'web3';
import { Token, TransactionsParams, SmallTokenInfo } from '@/wallet/types';
import { MAXUINT256 } from '@/utils/consts';

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
  token: SmallTokenInfo,
  amountToApprove: string,
  contractAddress: string,
  web3: Web3
): Promise<boolean> => {
  console.log(
    `checking asset needs unlocking: ${token.symbol} - ${token.address}`
  );
  if (isEth(token.address)) {
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
