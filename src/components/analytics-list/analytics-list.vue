<template>
  <div class="analytics-list">
    <h1 class="title">
      <slot name="title">{{ title }}</slot>
    </h1>
    <div class="description">
      <slot name="description">{{ description }}</slot>
    </div>
    <ul class="items" :class="wrapperClass">
      <slot></slot>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AnalyticsList',
  props: {
    wrapperClass: {
      type: String,
      default: undefined
    },
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
