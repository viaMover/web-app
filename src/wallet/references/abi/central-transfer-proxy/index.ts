import { AbiItem } from 'web3-utils';

import { Network } from '@/utils/networkTypes';

import arbitrum from './arbitrum.json';
import avalanche from './avalanche.json';
import binance from './binance.json';
import fantom from './fantom.json';
import mainnet from './mainnet.json';
import optimism from './optimism.json';
import polygon from './polygon.json';

const references = {
  [Network.mainnet]: mainnet,
  [Network.fantom]: fantom,
  [Network.polygon]: polygon,
  [Network.avalanche]: avalanche,
  [Network.binance]: binance,
  [Network.arbitrum]: arbitrum,
  [Network.optimism]: optimism
} as Record<Network, Array<AbiItem>>;

export const getCentralTransferProxyAbi = (network: Network): AbiItem[] => {
  return references[network] ?? references[Network.mainnet];
};
