import BigNumber from 'bignumber.js';

type BigNumberish = number | string | BigNumber;

export const multiply = (x: BigNumberish, y: BigNumberish): string =>
  new BigNumber(x).times(y).toFixed();
