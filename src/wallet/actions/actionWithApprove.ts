import Web3 from 'web3';

import { CompoundEstimateResponse } from '@/wallet/actions/types';
import { SmallToken } from '@/wallet/types';

import { approve } from './approve/approve';
import { needApprove } from './approve/needApprove';

export const executeTransactionWithApprove = async (
  token: SmallToken,
  contractAddress: string,
  amount: string,
  accountAddress: string,
  web3: Web3,
  action: (newGasLimit: string) => Promise<void>,
  estimateHandler: () => Promise<CompoundEstimateResponse>,
  changeStepToProcess: () => Promise<void>,
  approveGasLimit: string,
  actionGasLimit: string,
  gasPriceInGwei?: string
): Promise<void | never> => {
  if (await needApprove(accountAddress, token, amount, contractAddress, web3)) {
    await approve(
      accountAddress,
      token.address,
      contractAddress,
      web3,
      changeStepToProcess,
      approveGasLimit,
      gasPriceInGwei
    );

    const estimation = await estimateHandler();
    actionGasLimit = estimation.actionGasLimit;
  }

  await action(actionGasLimit);
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
