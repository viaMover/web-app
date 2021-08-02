<template>
  <div class="swaps__wrapper-search-items-item" @click="handleSelect">
    <token-image
      :address="item.address"
      :src="item.logo"
      :symbol="item.symbol"
      wrapper-class="icon"
    />
    <div class="info">
      <p>{{ item.name }}</p>
      <span>{{ item.symbol }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Token } from '@/wallet/types';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'SearchModalTokenItem',
  components: {
    TokenImage
  },
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
