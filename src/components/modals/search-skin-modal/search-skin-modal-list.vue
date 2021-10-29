<template>
  <div v-show="items.length">
    <div v-if="showHeader" class="items-title" :class="headerClass">
      <slot name="header">
        <h3>{{ headerText }}</h3>
      </slot>
    </div>
    <search-skin-modal-list-item
      v-for="item in items"
      :key="item.address"
      :item="item"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Token, TokenWithBalance } from '@/wallet/types';

import SearchSkinModalListItem from './search-skin-modal-list-item.vue';

export default Vue.extend({
  name: 'SearchSkinModalList',
  components: {
    SearchSkinModalListItem
  },
  props: {
    items: {
      type: Array as PropType<Array<Token | TokenWithBalance>>,
      required: true
    },
    showHeader: {
      type: Boolean,
      default: false
    },
    headerClass: {
      type: String,
      default: ''
    },
    headerText: {
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
