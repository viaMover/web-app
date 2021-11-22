import BigNumber from 'bignumber.js';

export const formatPercents = (percents: BigNumber.Value): string => {
  return new BigNumber(percents).toFormat(2);
};

export const formatToNative = (amount: BigNumber.Value): string => {
  return formatToDecimals(amount, 2);
};

export const formatToDecimals = (
  amount: BigNumber.Value,
  decimals: number,
  roundingMode?: BigNumber.RoundingMode
): string => {
  return new BigNumber(amount).toFormat(decimals, roundingMode);
};

export const getSignIfNeeded = (
  amount: BigNumber.Value,
  candidate: string
): string => {
  return new BigNumber(amount).isZero() ? '' : candidate;
};
