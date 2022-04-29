<template>
  <div class="secondary-page-header" @click="$emit('click')">
    <h1 v-if="title" class="title">{{ title }}</h1>
    <slot name="title"></slot>
    <div v-if="description" class="description">{{ description }}</div>
    <slot name="description"></slot>
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
