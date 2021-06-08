<template>
  <div v-if="items.length" class="list">
    <div v-if="hasHeader" class="header">
      <slot name="header"></slot>
    </div>
    <search-modal-token-item
      v-for="item in items"
      :key="item.address"
      :item="item"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { CoingeckoToken } from '@/services/coingecko/tokens';

import SearchModalTokenItem from './search-modal-token-item.vue';

export default Vue.extend({
  name: 'SearchModalTokenList',
  components: {
    SearchModalTokenItem
  },
  props: {
    items: {
      type: Array as PropType<Array<CoingeckoToken>>,
      required: true
    },
    hasHeader: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSelect(selected: CoingeckoToken): void {
      this.$emit('select', selected);
    }
  }
});
</script>

<style scoped lang="less">
.list {
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  .header {
    line-height: 1.5rem;
    font-weight: bold;
  }
}
</style>
