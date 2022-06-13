import Vue from 'vue';

import BigNumber from 'bignumber.js';

import { isZero } from '@/utils/bigmath';

export const NativeCurrencyFormatterMixin = Vue.mixin({
  methods: {
    formatAsCrypto(value: string | number, decimals = 2): string {
      const bn = new BigNumber(value);
      const mask = new BigNumber(10).pow(-decimals);
      if (bn.gte(mask)) {
        return bn.toFormat(decimals);
      } else {
        const formatted = bn.toFormat(18);
        const withoutTailZeros = formatted.replace(/\.?0*$/, '');
        const firstNonZeroDigit = withoutTailZeros.match(/(?<=\.0+)[1-9]/);
        if (firstNonZeroDigit === null) {
          return withoutTailZeros;
        }

        return `0.0...${firstNonZeroDigit}`;
      }
    },
    formatAsCryptoWithSymbol(
      value: string | number,
      symbol: string,
      decimals = 2
    ): string {
      return `${this.formatAsCrypto(value, decimals)} ${symbol}`;
    },
    formatAsNativeCurrency(
      value: string | number,
      forceFullCurrency?: boolean
    ): string {
      return this.$store.getters['account/nativeCurrencyFormatter'](
        value,
        forceFullCurrency
      );
    },
    formatAsNativeCurrencyWithOptionalSign(
      value: string | number,
      sign: string,
      forceFullCurrency?: boolean
    ): string {
      const formatted = this.formatAsNativeCurrency(value, forceFullCurrency);
      if (isZero(value)) {
        return formatted;
      }

      return sign + formatted;
    }
  }
});
