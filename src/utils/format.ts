import BigNumber from 'bignumber.js';

export const formatPercents = (percents: string): string => {
  return new BigNumber(percents).toFixed(2);
};

export const formatToNative = (amount: string): string => {
  return new BigNumber(amount).toFixed(2);
};
