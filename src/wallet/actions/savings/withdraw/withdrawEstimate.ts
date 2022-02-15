import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { HOLY_HAND_ABI, lookupAddress } from '@/wallet/references/data';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export type CompoundEstimateResponse = {
  error: boolean;
  approveGasLimit: string;
  actionGasLimit: string;
};

type EstimateResponse = {
  error: boolean;
  gasLimit: string;
};

export const estimateWithdrawCompound = async (
  outputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<CompoundEstimateResponse> => {
  const withdrawEstimate = await estimateWithdraw(
    outputAsset,
    inputAmount,
    network,
    web3,
    accountAddress
  );
  return {
    error: withdrawEstimate.error,
    approveGasLimit: '0',
    actionGasLimit: withdrawEstimate.gasLimit
  };
};

export const estimateWithdraw = async (
  outputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  console.log('Estimating savings withdraw...');

  const contractAddress = lookupAddress(network, 'HOLY_HAND_ADDRESS');
  const contractABI = HOLY_HAND_ABI;

  const poolAddress = lookupAddress(network, 'HOLY_SAVINGS_POOL_ADDRESS');

  try {
    const holyHand = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const outputAmountInWEI = toWei(inputAmount, outputAsset.decimals);

    console.log(
      '[savings withdraw estimation] output amount in WEI:',
      outputAmountInWEI
    );

    console.log(
      '[savings deposit estimation] transactionParams:',
      transactionParams
    );

    console.log(
      '[savings withdraw estimation] outputCurrencyAddress:',
      outputAsset.address
    );

    const gasLimitObj = await holyHand.methods
      .withdrawFromPool(poolAddress, outputAmountInWEI)
      .estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      console.log(
        '[savings withdraw estimation] gas estimation by web3: ' + gasLimit
      );
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[savings withdraw estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    console.error(`can't estimate savings withdraw due to: ${error}`);
    return {
      error: true,
      gasLimit: '0'
    };
  }
};
