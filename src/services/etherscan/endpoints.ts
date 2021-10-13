import { Network } from '@/utils/networkTypes';

export const apiEndpoints = new Map<Network, string>([
  [Network.mainnet, 'https://api.etherscan.io'],
  [Network.ropsten, 'https://api-ropsten.etherscan.io'],
  [Network.kovan, 'https://api-kovan.etherscan.io']
]);
