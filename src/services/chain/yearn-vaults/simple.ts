import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { OnChainServiceError } from '@/services/v2/on-chain';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { convertToString, fromWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  getSimpleYearnVaultTokenByAddress,
  YEARN_SIMPLE_VAULT_ABI
} from '@/wallet/references/data';

export const getYearnVaultMultiplier = async (
  network: Network,
  web3: Web3,
  tokenAddress: string,
  accountAddress: string
): Promise<string> => {
  const vaultToken = getSimpleYearnVaultTokenByAddress(tokenAddress, network);
  if (vaultToken === undefined) {
    addSentryBreadcrumb({
      type: 'error',
      category: 'yearn.simple.getMultiplier',
      message: 'failed find simple yearn vault by address',
      data: {
        address: tokenAddress
      }
    });
    throw new OnChainServiceError('Failed to get yearn vault multiplier');
  }

  const contract = new web3.eth.Contract(
    YEARN_SIMPLE_VAULT_ABI as AbiItem[],
    tokenAddress
  );

  const multiplier = await (
    contract.methods.pricePerShare() as ContractSendMethod
  ).call({
    from: accountAddress
  });

  const multiplierInWei = convertToString(multiplier);

  return fromWei(multiplierInWei, vaultToken.vaultToken.decimals);
};
