import { Network } from '@/utils/networkTypes';
import { lookupAddress } from '@/wallet/references/data';

export const simpleYearnVaultToken = (network: Network): Array<string> => {
  return [
    lookupAddress(network, 'YV_USDC_TOKEN_ADDRESS'),
    lookupAddress(network, 'YV_DAI_TOKEN_ADDRESS')
  ];
};
