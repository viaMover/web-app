import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { sameAddress } from '@/utils/address';
import { floorDivide, toWei } from '@/utils/bigmath';
import { multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { estimateApprove } from '@/wallet/actions/approve/approveEstimate';
import { needApprove } from '@/wallet/actions/approve/needApprove';
import {
  CompoundEstimateResponse,
  EstimateResponse
} from '@/wallet/actions/types';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  HOLY_HAND_ABI,
  HOLY_HAND_ADDRESS
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { SmallToken, TransactionsParams } from '@/wallet/types';

export const estimateDepositCompound = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<CompoundEstimateResponse> => {
  const contractAddress = HOLY_HAND_ADDRESS(network);

  let isApproveNeeded = true;
  try {
    isApproveNeeded = await needApprove(
      accountAddress,
      inputAsset,
      inputAmount,
      contractAddress,
      web3
    );
  } catch (err) {
    console.error(`Can't estimate approve:`, err);
    return {
      error: true,
      approveGasLimit: '0',
      actionGasLimit: '0'
    };
  }

  if (isApproveNeeded) {
    console.log("Needs approve, can't do a proper estimation");
    try {
      const approveGasLimit = await estimateApprove(
        accountAddress,
        inputAsset.address,
        contractAddress,
        web3
      );

      return {
        error: false,
        actionGasLimit: ethDefaults.basic_holy_treasury_deposit,
        approveGasLimit: approveGasLimit
      };
    } catch (err) {
      console.error(`Can't estimate approve:`, err);
      return {
        error: true,
        actionGasLimit: '0',
        approveGasLimit: '0'
      };
    }
  } else {
    const depositEstimate = await estimateDeposit(
      inputAsset,
      inputAmount,
      network,
      web3,
      accountAddress
    );
    return {
      error: depositEstimate.error,
      approveGasLimit: '0',
      actionGasLimit: depositEstimate.gasLimit
    };
  }
};

export const estimateDeposit = async (
  inputAsset: SmallToken,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  console.log('Estimating treasury deposit...');

  const move = getMoveAssetData(network);
  const slp = getMoveWethLPAssetData(network);

  const contractAddress = HOLY_HAND_ADDRESS(network);
  const contractABI = HOLY_HAND_ABI;

  try {
    const holyHand = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const inputAmountInWEI = toWei(inputAmount, inputAsset.decimals);

    console.log(
      '[treasury deposit estimation] input amount in WEI:',
      inputAmountInWEI
    );

    console.log(
      '[treasury deposit estimation] transactionParams:',
      transactionParams
    );

    let gasLimitObj;

    if (sameAddress(inputAsset.address, move.address)) {
      gasLimitObj = await holyHand.methods
        .depositToTreasury(inputAmountInWEI, '0')
        .estimateGas(transactionParams);
    } else if (sameAddress(inputAsset.address, slp.address)) {
      gasLimitObj = await holyHand.methods
        .depositToTreasury('0', inputAmountInWEI)
        .estimateGas(transactionParams);
    } else {
      throw new Error(
        `wrong token in treasury deposit: ${inputAsset.address} ${inputAsset.symbol}`
      );
    }

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      console.log(
        '[treasury deposit estimation] gas estimation by web3: ' + gasLimit
      );
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[treasury deposit estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    console.error(`can't estimate treasury deposit due to: ${error}`);
    return {
      error: true,
      gasLimit: '0'
    };
  }
};
