<template>
  <div class="secondary-page-header">
    <h1 v-if="title" class="title">{{ title }}</h1>
    <div v-if="description" class="description">{{ description }}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SecondaryPageHeader',
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
