import BigNumber from 'bignumber.js';

type BigNumberish = number | string | BigNumber;

export const add = (numberOne: BigNumberish, numberTwo: BigNumberish): string =>
  new BigNumber(numberOne).plus(numberTwo).toFixed();

export const multiply = (x: BigNumberish, y: BigNumberish): string =>
  new BigNumber(x).times(y).toFixed();

export const divide = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish
): string => {
  if (!(numberOne || numberTwo)) return '0';
  return new BigNumber(numberOne).dividedBy(numberTwo).toFixed();
};

export const greaterThan = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish
): boolean => new BigNumber(numberOne).gt(numberTwo);

export const greaterThanOrEqual = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish
): boolean => new BigNumber(numberOne).gte(numberTwo);

export const lessThan = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish
): boolean => new BigNumber(numberOne).lt(numberTwo);

export const lessThanOrEqual = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish
): boolean => new BigNumber(numberOne).lte(numberTwo);

export const notZero = (numberOne: BigNumberish): boolean =>
  new BigNumber(numberOne).gt('0');

export const toWei = (value: BigNumberish, decimals: number | string): string =>
  new BigNumber(value).times(new BigNumber(10).pow(decimals)).toFixed();

export const fromWei = (
  value: BigNumberish,
  decimals: number | string
): string =>
  new BigNumber(value).dividedBy(new BigNumber(10).pow(decimals)).toFixed();

export const floorDivide = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish
): string =>
  new BigNumber(numberOne)
    .dividedToIntegerBy(new BigNumber(numberTwo))
    .toFixed();

export const isNaN = (num: BigNumberish): boolean => {
  return new BigNumber(num).isNaN();
};

export const isFinite = (num: BigNumberish): boolean => {
  return new BigNumber(num).isFinite();
};
