import BigNumber from 'bignumber.js';

export const formatPercents = (percents: string): string => {
  return new BigNumber(percents).toFixed(2);
};
