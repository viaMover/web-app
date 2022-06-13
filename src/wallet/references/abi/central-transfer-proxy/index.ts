import { AbiItem } from 'web3-utils';

import { Network } from '@/utils/networkTypes';

import avalanche from './avalanche.json';
import fantom from './fantom.json';
import mainnet from './mainnet.json';
import polygon from './polygon.json';
import binance from './polygon.json'; // TODO: change to Binance

const references = {
  [Network.mainnet]: mainnet,
  [Network.fantom]: fantom,
  [Network.polygon]: polygon,
  [Network.avalanche]: avalanche,
  [Network.avalanche]: binance
} as Record<Network, Array<AbiItem>>;

export const getCentralTransferProxyAbi = (network: Network): AbiItem[] => {
  return references[network] ?? references[Network.mainnet];
};
