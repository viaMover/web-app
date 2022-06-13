<template>
  <form-custom-switch class="mb-40" :value="value" @input="handleToggle">
    <slot>{{ text }}</slot>
    {{ amountText }}
  </form-custom-switch>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { multiply } from '@/utils/bigmath';
import { TokenWithBalance } from '@/wallet/types';

import FormCustomSwitch from './form-custom-switch.vue';
import { InputMode } from './types';

export default Vue.extend({
  name: 'FormUseAll',
  components: {
    FormCustomSwitch
  },
  props: {
    token: {
      type: Object as PropType<TokenWithBalance>,
      required: true
    },
    inputMode: {
      type: String as PropType<InputMode>,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    },
    text: {
      type: String,
      default: undefined
    }
  },
  computed: {
    nativeAmount(): string {
      return multiply(this.token.balance, this.token.priceUSD);
    },
    amountText(): string {
      if (this.inputMode === 'TOKEN') {
        return this.formatAsCryptoWithSymbol(
          this.token.balance,
          this.token.symbol
        );
      }

      return this.formatAsNativeCurrency(this.nativeAmount, true);
    }
  },
  watch: {
    token(): void {
      this.$emit('input', false);
    }
  },
  methods: {
    handleToggle(newValue: boolean): void {
      this.$emit('input', newValue);
    }
  }
});
</script>
