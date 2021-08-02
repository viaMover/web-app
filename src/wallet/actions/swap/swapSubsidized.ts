import { BigNumber } from 'bignumber.js';
import { multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { SmallToken } from '@/wallet/types';
import { TransferData } from '@/services/0x/api';
import Web3 from 'web3';
import {
  ACTION,
  createSwapActionString,
  sendSubsidizedRequest,
  SubsidizedRequestError
} from '../subsidized';

export const swapSubsidized = async (
  inputAsset: SmallToken,
  outputAsset: SmallToken,
  inputAmount: string,
  transferData: TransferData,
  network: Network,
  web3: Web3,
  accountAddress: string,
  changeStepToProcess: () => Promise<void>
): Promise<void> => {
  console.log('Executing SUBSUDIZED swap...');

  const expectedMinimumReceived = new BigNumber(
    multiply(transferData.buyAmount, '0.85')
  ).toFixed(0);

  console.log(
    '[subsidized swap] expected minimum received:',
    expectedMinimumReceived
  );

  const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

  const actionString = createSwapActionString(
    accountAddress,
    inputAsset.address,
    outputAsset.address,
    inputAmountInWEI,
    expectedMinimumReceived
  );

  try {
    const subsidizedResponse = await sendSubsidizedRequest(
      ACTION.SWAP,
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
