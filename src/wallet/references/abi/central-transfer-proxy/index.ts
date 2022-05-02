import { AbiItem } from 'web3-utils';

import { Network } from '@/utils/networkTypes';

import fantom from './fantom.json';
import mainnet from './mainnet.json';
import polygon from './polygon.json';

const references = {
  [Network.mainnet]: mainnet,
  [Network.fantom]: fantom,
  [Network.polygon]: polygon
} as Record<Network, Array<AbiItem>>;

export const getCentralTransferProxyAbi = (network: Network): AbiItem[] => {
  return references[network] ?? references[Network.mainnet];
};
