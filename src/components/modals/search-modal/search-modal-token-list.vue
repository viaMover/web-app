<template>
  <div v-show="items.length">
    <div
      v-if="showHeader && headerText !== ''"
      class="items-title"
      :class="headerClass"
    >
      <slot name="header">
        <h3>{{ headerText }}</h3>
      </slot>
    </div>
    <search-modal-token-item
      v-for="item in items"
      :key="item.address"
      :item="item"
      :show-balance="showBalances"
      @select="handleSelect"
    />
    <infinite-loading
      v-if="infinityLoad"
      @infinite="infiniteHandler"
    ></infinite-loading>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import SearchModalTokenItem from './search-modal-token-item.vue';
import { Token, TokenWithBalance } from '@/wallet/types';
import InfiniteLoading, { StateChanger } from 'vue-infinite-loading';

export default Vue.extend({
  name: 'SearchModalTokenList',
  components: {
    SearchModalTokenItem,
    InfiniteLoading
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
    },
    showBalances: {
      type: Boolean,
      default: false
    },
    infinityLoad: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSelect(selected: Token): void {
      this.$emit('select', selected);
    },
    infiniteHandler($state: StateChanger): void {
      this.$emit('load-more', $state);
    }
  }
});
</script>
