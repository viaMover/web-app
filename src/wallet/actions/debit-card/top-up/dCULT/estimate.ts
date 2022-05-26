import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { floorDivide, multiply, toWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { EstimateResponse } from '@/wallet/actions/types';
import { DCULT_ABI, lookupAddress } from '@/wallet/references/data';
import { SmallTokenInfo } from '@/wallet/types';

export const estimateDCULTUnstake = async (
  inputAsset: SmallTokenInfo,
  inputAmount: string,
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<EstimateResponse> => {
  const contract = new web3.eth.Contract(
    DCULT_ABI as AbiItem[],
    lookupAddress(network, 'DCULT_TOKEN_ADDRESS')
  );

  const inputAmountInWei = toWei(inputAmount, inputAsset.decimals);

  const gasLimitObj = await (
    contract.methods.withdraw('0', inputAmountInWei) as ContractSendMethod
  ).estimateGas({ from: accountAddress });

  if (!gasLimitObj) {
    throw new Error('Failed to estimate gas: empty gasLimitObj');
  }

  return {
    error: false,
    gasLimit: floorDivide(multiply(gasLimitObj.toString(), '120'), '100')
  };
};
