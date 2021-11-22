import Web3 from 'web3';

import { Network } from '@/utils/networkTypes';

import { GetEarningsAPYReturn } from './types';

export const getSavingsAPY = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<GetEarningsAPYReturn> => {
  return {
    apy: '5',
    dpy: '6'
  };
};

export const getEthereumBalance = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  return '0';
};
