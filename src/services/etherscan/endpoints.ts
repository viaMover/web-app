import { Network, networks } from '@/utils/networkTypes';

export const apiEndpoints = new Map<Network, string>([
  [Network.mainnet, 'https://api.etherscan.io'],
  [Network.kovan, 'https://api-kovan.etherscan.io']
]);
