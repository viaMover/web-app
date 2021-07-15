<template>
  <div :class="wrapperClass">
    <h2>
      <slot name="title">{{ title }}</slot>
    </h2>
    <statement-nav-list-item
      v-for="item in items"
      :key="item.snapshotTimestamp"
      :button-text="buttonText"
      :class="itemClass"
      :icon="icon"
      :in-progress-text="inProgressText"
      :item="item"
      :navigate-to-name="navigateToName"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import StatementNavListItem from './statement-nav-list-item.vue';

export default Vue.extend({
  name: 'StatementNavList',
  components: {
    StatementNavListItem
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    navigateToName: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      default: ''
    },
    inProgressText: {
      type: String,
      default: ''
    }
  },
  computed: {
    itemClass(): string {
      return `${this.wrapperClass}-item`;
    }
  }
});
</script>
