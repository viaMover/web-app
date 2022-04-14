import Vue from 'vue';

import { isZero } from '@/utils/bigmath';

export const NativeCurrencyFormatterMixin = Vue.mixin({
  methods: {
    formatAsNativeCurrency(value: string | number): string {
      return this.$store.getters['account/nativeCurrencyFormatter'](value);
    },
    formatAsNativeCurrencyWithOptionalSign(
      value: string | number,
      sign: string
    ): string {
      const formatted = this.formatAsNativeCurrency(value);
      if (isZero(value)) {
        return formatted;
      }

      return sign + formatted;
    }
  }
});
