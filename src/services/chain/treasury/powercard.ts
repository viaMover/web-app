import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { greaterThanOrEqual, isEqual, lessThanOrEqual } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  NFT_RARI_ABI,
  POWERCARD_ADDRESS,
  POWERCARD_RARI_ID,
  POWERCARD_STAKER,
  POWERCARD_STAKER_ABI
} from '@/wallet/references/data';
import { TransactionsParams } from '@/wallet/types';

import { PowercardState, PowerCardTimings } from './types';

export const MAX_ACTIVE_TIME = 2592000; // seconds
export const MAX_COOLDOWN_TIME = 5184000; // seconds

export const powercardBalance = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<string> => {
  if (network !== Network.mainnet) {
    console.log('Powercard is disabled for not ethereum mainnet: ', network);
    return '0';
  }

  const contractAddress = POWERCARD_ADDRESS(network);
  const contractABI = NFT_RARI_ABI;

  const rari = new web3.eth.Contract(contractABI as AbiItem[], contractAddress);

  try {
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const powercardBalanceResponse = await rari.methods
      .balanceOf(accountAddress, POWERCARD_RARI_ID)
      .call(transactionParams);

    const powercardBalance = powercardBalanceResponse.toString();
    console.log('Powercard balance: ', powercardBalance);

    return powercardBalance;
  } catch (error) {
    throw new Error(`error powercard balance checking: ${error}`);
  }
};

export const getPowercardState = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<PowercardState> => {
  if (network !== Network.mainnet) {
    console.log('Powercard is disabled for not ethereum mainnet: ', network);
    return 'NotStaked';
  }

  const contractAddress = POWERCARD_STAKER(network);
  const contractABI = POWERCARD_STAKER_ABI;

  const powercardStaker = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  try {
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const powercardStateResponse = await powercardStaker.methods
      .getPowercardIndex(accountAddress)
      .call(transactionParams);

    const powercardState = powercardStateResponse.toString();
    console.log('Powercard state: ', powercardState);

    if (
      lessThanOrEqual(powercardState, 20) &&
      greaterThanOrEqual(powercardState, 0)
    ) {
      return 'Staked';
    } else if (isEqual(powercardState, 32768)) {
      return 'NotStaked';
    } else if (isEqual(powercardState, 32769)) {
      return 'NotStakedCooldown';
    } else {
      throw new Error(`wrong state index: ${powercardState}`);
    }
  } catch (error) {
    throw new Error(`error powercard state: ${error}`);
  }
};

export const getPowercardTimings = async (
  accountAddress: string,
  network: Network,
  web3: Web3
): Promise<PowerCardTimings> => {
  if (network !== Network.mainnet) {
    console.log('Powercard is disabled for not ethereum mainnet: ', network);
    return { activeTime: '0', cooldownTime: '0' };
  }

  const contractAddress = POWERCARD_STAKER(network);
  const contractABI = POWERCARD_STAKER_ABI;

  const powercardStaker = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  try {
    const transactionParams = {
      from: accountAddress
    } as TransactionsParams;

    const remainingTimingsResponse = await powercardStaker.methods
      .getRemainingTimings(accountAddress)
      .call(transactionParams);

    const activeTimeResponse =
      remainingTimingsResponse.active ?? remainingTimingsResponse[0];

    const cooldownTimeResponse =
      remainingTimingsResponse.cooldown ?? remainingTimingsResponse[1];

    console.log(
      'Powercard timings: active - ',
      activeTimeResponse,
      ' cooldown - ',
      cooldownTimeResponse
    );

    return {
      activeTime: activeTimeResponse.toString(),
      cooldownTime: cooldownTimeResponse.toString()
    };
  } catch (error) {
    console.error(error);
    throw new Error(`error powercard timings: ${error}`);
  }
};
