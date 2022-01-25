<template>
  <div class="secondary-page-header">
    <h1 class="title">{{ title }}</h1>
    <div class="description">{{ description }}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SecondaryPageHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  }
});
</script>
