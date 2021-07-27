<template>
  <div class="swaps__wrapper-search-items-item" @click="handleSelect">
    <div class="icon">
      <img v-get-shadow="item.color" :alt="item.symbol" :src="item.logo" />
    </div>
    <div class="info">
      <p>{{ item.name }}</p>
      <span>{{ item.symbol }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Token } from '@/wallet/types';

export default Vue.extend({
  name: 'SearchModalTokenItem',
  props: {
    item: {
      type: Object as PropType<Token>,
      required: true
    }
  },
  methods: {
    handleSelect(): void {
      this.$emit('select', this.item);
    }
  }
});
</script>
