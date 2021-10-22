import { Network } from '@/utils/networkTypes';

export const apiEndpoints = new Map<Network, string>([
  [Network.mainnet, 'https://mainnet.infura.io/v3'],
  [Network.ropsten, 'https://ropsten.infura.io/v3'],
  [Network.rinkeby, 'https://rinkeby.infura.io/v3'],
  [Network.kovan, 'https://kovan.infura.io/v3']
]);
