<template>
  <p class="info rate slippage button-active" @click="toggleSlippage">
    {{ formatedSlippage }}
  </p>
</template>

<script lang="ts">
import Vue from 'vue';

import { formatPercents } from '@/utils/format';

export type Slippage = '1' | '0.5' | '0.1';

const avaialbelSlippages = Array<Slippage>('1', '0.5', '0.1');

export default Vue.extend({
  name: 'SlippageSelector',
  props: {
    slippage: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      availabelSlippages: avaialbelSlippages,
      selectedSlippageIndex: avaialbelSlippages.findIndex(
        (s) => s === this.slippage
      )
    };
  },
  computed: {
    selectedSlippage(): Slippage {
      return this.availabelSlippages[this.selectedSlippageIndex];
    },
    formatedSlippage(): string {
      return `${formatPercents(this.selectedSlippage)}%`;
    }
  },
  methods: {
    toggleSlippage(): void {
      console.log('CLICKED');
      this.selectedSlippageIndex =
        (this.selectedSlippageIndex + 1) % this.availabelSlippages.length;
      this.$nextTick(() => {
        if (this.selectedSlippageIndex !== undefined) {
          this.$emit('selected-slippage-changed', this.selectedSlippage);
        }
      });
    }
  }
});
</script>
