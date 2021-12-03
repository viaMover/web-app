import Web3 from 'web3';

import { Network } from '@/utils/networkTypes';

import { GetEarningsAPYReturn } from './types';

export const getOlympusAPY = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<GetEarningsAPYReturn> => {
  return {
    apy: '7.333',
    dpy: '6'
  };
};

export const getOlympusBalance = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  return '0';
};
