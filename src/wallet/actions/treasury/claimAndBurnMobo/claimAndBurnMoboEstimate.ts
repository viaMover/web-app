import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { floorDivide, multiply } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  CompoundEstimateResponse,
  EstimateResponse
} from '@/wallet/actions/types';
import {
  SMART_TREASURY_ABI,
  SMART_TREASURY_ADDRESS
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

export const estimateClaimAndBurnMOBOCompound = async (
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<CompoundEstimateResponse> => {
  const claimAndBurnEstimate = await estimateClaimAndBurnMOBO(
    network,
    web3,
    accountAddress
  );
  return {
    error: claimAndBurnEstimate.error,
    approveGasLimit: '0',
    actionGasLimit: claimAndBurnEstimate.gasLimit
  };
};

export const estimateClaimAndBurnMOBO = async (
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  const contractAddress = SMART_TREASURY_ADDRESS(network);
  const contractABI = SMART_TREASURY_ABI;

  try {
    const treasury = new web3.eth.Contract(
      contractABI as AbiItem[],
      contractAddress
    );

    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const gasLimitObj = await (
      treasury.methods.claimUSDCforBonus() as ContractSendMethod
    ).estimateGas(transactionParams);

    if (gasLimitObj) {
      const gasLimit = gasLimitObj.toString();
      console.log(
        '[treasury claim and burn MOBO estimation] gas estimation by web3: ' +
          gasLimit
      );
      const gasLimitWithBuffer = floorDivide(multiply(gasLimit, '120'), '100');
      console.log(
        '[treasury claim and burn MOBO estimation] gas estimation by web3 (with additional 20% as buffer): ' +
          gasLimitWithBuffer
      );
      return { error: false, gasLimit: gasLimitWithBuffer };
    } else {
      throw new Error('empty gas limit');
    }
  } catch (error) {
    console.error(`can't estimate treasury claim and burn MOBO`, error);
    return {
      error: true,
      gasLimit: '0'
    };
  }
};
