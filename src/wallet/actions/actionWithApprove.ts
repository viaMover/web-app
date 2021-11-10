import Web3 from 'web3';

import { SmallToken } from '@/wallet/types';

import { approve } from './approve/approve';
import { needApprove } from './approve/needApprove';

export const executeTransactionWithApprove = async (
  token: SmallToken,
  contractAddress: string,
  amount: string,
  accountAddress: string,
  web3: Web3,
  action: () => Promise<void>,
  changeStepToProcess: () => Promise<void>,
  gasLimit: string,
  gasPriceInGwei?: string
): Promise<void | never> => {
  try {
    if (
      await needApprove(accountAddress, token, amount, contractAddress, web3)
    ) {
      await approve(
        accountAddress,
        token.address,
        contractAddress,
        web3,
        changeStepToProcess,
        gasLimit,
        gasPriceInGwei
      );
    }
  } catch (err) {
    throw new Error(`can't approve due to: ${err}`);
  }
  await action();
};
export const executeTransactionWithApproveExt = async (
  actionFunc: () => Promise<void>,
  checkAppproveFunc: () => Promise<boolean>,
  approveFunc: () => Promise<void>
): Promise<void | never> => {
  try {
    if (!(await checkAppproveFunc())) {
      await approveFunc();
    }
  } catch (err) {
    throw new Error(`can't approve ext due to: ${err}`);
  }
  await actionFunc();
};
