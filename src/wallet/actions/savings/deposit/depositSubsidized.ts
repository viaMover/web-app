import { toWei } from '@/utils/bigmath';
import { createSavingsDepositActionString } from '@/wallet/actions/subsidized';
import { Network } from '@/utils/networkTypes';
import { SmallToken } from '@/wallet/types';
import { TransferData } from '@/services/0x/api';
import Web3 from 'web3';
import {
  ACTION,
  sendSubsidizedRequest,
  SubsidizedRequestError
} from '@/wallet/actions/subsidized';
import { HOLY_SAVINGS_POOL_ADDRESS } from '@/wallet/references/data';

export const depositSubsidized = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData | undefined,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing SUBSUDIZED savings deposit...');

  const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

  const poolAddress = HOLY_SAVINGS_POOL_ADDRESS(network);

  const actionString = createSavingsDepositActionString(
    accountAddress,
    poolAddress,
    inputAsset.address,
    inputAmountInWEI
  );

  try {
    const subsidizedResponse = await sendSubsidizedRequest(
      ACTION.SAVINGS_DEPOSIT,
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
