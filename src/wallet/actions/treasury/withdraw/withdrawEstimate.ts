import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { sameAddress } from '@/utils/address';
import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  lookupAddress,
  SMART_TREASURY_ABI
} from '@/wallet/references/data';
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
  console.log('Estimating treasury withdraw...');

  const move = getMoveAssetData(network);
  const slp = getMoveWethLPAssetData(network);

  const contractAddress = lookupAddress(network, 'SMART_TREASURY_ADDRESS');
  const contractABI = SMART_TREASURY_ABI;

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
      '[treasury withdraw estimation] output amount in WEI:',
      outputAmountInWEI
    );
    console.log(
      '[treasury deposit estimation] transactionParams:',
      transactionParams
    );
    console.log(
      '[treasury withdraw estimation] outputCurrencyAddress:',
      outputAsset.address
    );

    let gasLimitObj;

    if (sameAddress(outputAsset.address, move.address)) {
      gasLimitObj = await holyHand.methods
        .withdraw(outputAmountInWEI, '0')
        .estimateGas(transactionParams);
    } else if (sameAddress(outputAsset.address, slp.address)) {
      gasLimitObj = await holyHand.methods
        .withdraw('0', outputAmountInWEI)
        .estimateGas(transactionParams);
    } else {
      throw new Error(
        `wrong token in treasury withdraw: ${outputAsset.address} ${outputAsset.symbol}`
      );
    }

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      console.log(
        '[treasury withdraw estimation] gas estimation by web3: ' + gasLimit
      );
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[treasury withdraw estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    console.error(`can't estimate treasury withdraw due to: ${error}`);
    return {
      error: true,
      gasLimit: '0'
    };
  }
};
