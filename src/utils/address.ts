import { BigNumber } from 'bignumber.js';
export const sameAddress = (addr1: string, addr2: string): boolean => {
  if (addr1 === undefined || addr2 === undefined) {
    return false;
  }
  return addr1.toLowerCase() === addr2.toLowerCase();
};

export const getPureEthAddress = (): string =>
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const convertStringToHexWithPrefix = (stringToConvert: string): string =>
  `0x${new BigNumber(stringToConvert).toString(16)}`;
