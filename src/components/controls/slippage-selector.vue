<template>
  <p class="info rate slippage button-active" @click="toggleSlippage">
    {{ formatedSlippage }}
  </p>
</template>

<script lang="ts">
import Vue from 'vue';

import { formatPercents } from '@/utils/format';

export type Slippage = '10' | '5' | '1';

const availableSlippages = Array<Slippage>('10', '5', '1');

export default Vue.extend({
  name: 'SlippageSelector',
  props: {
    slippage: {
      type: String,
      default: '10'
    }
  },
  data() {
    return {
      availableSlippages: availableSlippages,
      selectedSlippageIndex: availableSlippages.findIndex(
        (s) => s === this.slippage
      )
    };
  },
  computed: {
    selectedSlippage(): Slippage {
      return this.availableSlippages[this.selectedSlippageIndex];
    },
    formatedSlippage(): string {
      return `${formatPercents(this.selectedSlippage)}%`;
    }
  },
  methods: {
    toggleSlippage(): void {
      this.selectedSlippageIndex =
        (this.selectedSlippageIndex + 1) % this.availableSlippages.length;
      this.$nextTick(() => {
        if (this.selectedSlippageIndex !== undefined) {
          this.$emit('selected-slippage-changed', this.selectedSlippage);
        }
      });
    }
  }
});
</script>
