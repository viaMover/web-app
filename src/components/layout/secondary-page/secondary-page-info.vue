<template>
  <div class="secondary-page-info">
    <div class="title">{{ title }}</div>
    <div class="description">{{ description }}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SecondaryPageInfo',
  props: {
    title: {
      type: String,
      default: undefined
    },
    description: {
      type: String,
      default: undefined
    }
  }
});
</script>
