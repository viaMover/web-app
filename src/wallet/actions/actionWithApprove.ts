import { lessThan, lessThanOrEqual } from './../../utils/bigmath';
import { approve } from './approve/approve';
import { needApprove } from './approve/needApprove';
import { SmallToken } from '@/wallet/types';
import Web3 from 'web3';
export const executeTransactionWithApprove = async (
  token: SmallToken,
  contractAddress: string,
  amount: string,
  accountAddress: string,
  web3: Web3,
  gasLimit: string,
  gasPriceInGwei: string,
  action: () => Promise<void>
) => {
  if (lessThanOrEqual(gasPriceInGwei, '0')) {
    throw new Error("can't execute transaction with zero gas price");
  }

  try {
    if (
      await needApprove(accountAddress, token, amount, contractAddress, web3)
    ) {
      await approve(
        accountAddress,
        token.address,
        contractAddress,
        gasLimit,
        gasPriceInGwei,
        web3
      );
    }
  } catch (err) {
    throw new Error(`can't approve due to: ${err}`);
  }
  await action();
};
