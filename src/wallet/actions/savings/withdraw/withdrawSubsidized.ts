import { createSavingsWithdrawActionString } from './../../subsidized';
import { toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { SmallToken } from '@/wallet/types';
import Web3 from 'web3';
import {
  ACTION,
  sendSubsidizedRequest,
  SubsidizedRequestError
} from '@/wallet/actions/subsidized';
import { HOLY_SAVINGS_POOL_ADDRESS } from '@/wallet/references/data';

export const withdrawSubsidized = async (
  outputAsset: SmallToken,
  outputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing SUBSUDIZED savings withdraw...');

  const outputAmountInWEI = toWei(outputAmount, outputAsset.decimals);

  const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

  const actionString = createSavingsWithdrawActionString(
    accountAddress,
    poolAddress,
    outputAmountInWEI
  );

  try {
    const subsidizedResponse = await sendSubsidizedRequest(
      ACTION.SAVINGS_WITHDRAW,
      actionString,
      accountAddress,
      network,
      web3,
      changeStepToProcess
    );
  } catch (err) {
    if (err instanceof SubsidizedRequestError) {
      console.error(`Subsidized request error: ${err.message}`);
    }
  }
};
