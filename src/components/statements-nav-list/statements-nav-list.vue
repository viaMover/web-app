<template>
  <div class="statements-list">
    <h2 class="header">
      <slot name="title">{{ title }}</slot>
    </h2>
    <statements-nav-list-item
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

import StatementsNavListItem from './statements-nav-list-item.vue';

export default Vue.extend({
  name: 'StatementsNavList',
  components: {
    StatementsNavListItem
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    itemClass: {
      type: String,
      default: undefined
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
  }
});
</script>
