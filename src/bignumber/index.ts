import { BigNumber } from 'bignumber.js';

export const init = (): void => {
  BigNumber.config({
    FORMAT: {
      // string to prepend
      prefix: '',
      // decimal separator
      decimalSeparator: '.',
      // grouping separator of the integer part
      groupSeparator: ',',
      // primary grouping size of the integer part
      groupSize: 3,
      // secondary grouping size of the integer part
      secondaryGroupSize: 3,
      // grouping separator of the fraction part
      fractionGroupSeparator: ' ',
      // grouping size of the fraction part
      fractionGroupSize: 0,
      // string to append
      suffix: ''
    }
  });
};
