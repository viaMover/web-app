import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { multiply } from '@/utils/bigmath';
import { floorDivide } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { EstimateResponse } from '@/wallet/actions/types';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
import {
  POWERCARD_STAKER,
  POWERCARD_STAKER_ABI
} from '@/wallet/references/data';
import ethDefaults from '@/wallet/references/defaults';
import { TransactionsParams } from '@/wallet/types';

import { isPowercardApproved } from './approve';
import { estimatePowercardApprove } from './approveEstimate';

export const estimateUnstakePowercardCompound = async (
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<CompoundEstimateResponse> => {
  const contractAddress = POWERCARD_STAKER(network);

  let isApproved = false;
  try {
    isApproved = await isPowercardApproved(contractAddress, network, web3);
  } catch (err) {
    console.error(`Can't estimate powercard approve: ${err}`);
    return {
      error: true,
      approveGasLimit: '0',
      actionGasLimit: '0'
    };
  }

  if (!isApproved) {
    console.log("Needs approve, can't do a proper estimation");
    try {
      const approveGasLimit = await estimatePowercardApprove(
        contractAddress,
        accountAddress,
        network,
        web3
      );

      return {
        error: false,
        actionGasLimit: ethDefaults.basic_approval,
        approveGasLimit: approveGasLimit
      };
    } catch (err) {
      console.error(`Can't estimate powercard approve: ${err}`);
      return {
        error: true,
        actionGasLimit: '0',
        approveGasLimit: '0'
      };
    }
  } else {
    const depositEstimate = await estimatePowercardUnstake(
      accountAddress,
      contractAddress,
      web3
    );
    return {
      error: depositEstimate.error,
      approveGasLimit: '0',
      actionGasLimit: depositEstimate.gasLimit
    };
  }
};

export const estimatePowercardUnstake = async (
  accountAddress: string,
  contractAddress: string,
  web3: Web3
): Promise<EstimateResponse> => {
  console.log('Estimating powercard unstake...');

  const contractABI = POWERCARD_STAKER_ABI;

  try {
    const powercardStaker = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const gasLimitObj = await powercardStaker.methods
      .unstakePowercard()
      .estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      console.log(
        '[powercard unstake estimation] gas estimation by web3: ' + gasLimit
      );
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[powercard unstake estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    console.error(`can't estimate powercard unstake due to: ${error}`);
    return {
      error: true,
      gasLimit: '0'
    };
  }
};
