<template>
  <div class="item" @click="handleSelect">
    <div class="icon">
      <img :alt="item.symbol" :src="item.logo" />
    </div>
    <div class="info">
      <div class="name">{{ item.name }}</div>
      <div class="symbol">{{ item.symbol }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { CoingeckoToken } from '@/services/coingecko/tokens';

export default Vue.extend({
  name: 'SearchModalTokenItem',
  props: {
    item: {
      type: Object as PropType<CoingeckoToken>,
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

<style scoped lang="less">
.item {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;

  .icon {
    flex: 0 0 1rem;
    height: 1rem;
    margin-right: 0.5rem;

    img {
      height: 100%;
      width: 100%;
    }
  }

  .info {
    flex: 1 0 50%;
    display: flex;
    flex-flow: column nowrap;

    .name {
      font-weight: bolder;
      margin-bottom: 0.25rem;
    }
  }
}
</style>
