import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { convertToString } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { GALCX_ABI, lookupAddress } from '@/wallet/references/data';

export const getGALCXToALCXMultiplier = async (
  network: Network,
  web3: Web3,
  accountAddress: string
): Promise<string> => {
  const contract = new web3.eth.Contract(
    GALCX_ABI as AbiItem[],
    lookupAddress(network, 'GALCX_TOKEN_ADDRESS')
  );

  const multiplier = await (
    contract.methods.exchangeRate() as ContractSendMethod
  ).call({
    from: accountAddress
  });

  return convertToString(multiplier);
};
