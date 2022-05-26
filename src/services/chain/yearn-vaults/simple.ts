import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { convertToString } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { YEARN_SIMPLE_VAULT_ABI } from '@/wallet/references/data';

export const getYearnVaultMultiplier = async (
  network: Network,
  web3: Web3,
  tokenAddress: string,
  accountAddress: string
): Promise<string> => {
  const contract = new web3.eth.Contract(
    YEARN_SIMPLE_VAULT_ABI as AbiItem[],
    tokenAddress
  );

  const multiplier = await (
    contract.methods.pricePerShare() as ContractSendMethod
  ).call({
    from: accountAddress
  });

  return convertToString(multiplier);
};
