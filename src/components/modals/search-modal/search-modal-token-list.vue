<template>
  <div v-show="items.length">
    <div v-if="hasHeader" class="items-title" :class="headerClass">
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

import SearchModalTokenItem from './search-modal-token-item.vue';
import { Token } from '@/wallet/types';

export default Vue.extend({
  name: 'SearchModalTokenList',
  components: {
    SearchModalTokenItem
  },
  props: {
    items: {
      type: Array as PropType<Array<Token>>,
      required: true
    },
    hasHeader: {
      type: Boolean,
      default: false
    },
    headerClass: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleSelect(selected: Token): void {
      this.$emit('select', selected);
    }
  }
});
</script>
