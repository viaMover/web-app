<template>
  <div class="analytics-list">
    <component :is="headerComponent" class="title">
      <slot name="title">{{ title }}</slot>
    </component>
    <div class="description">
      <slot name="description">{{ description }}</slot>
    </div>
    <ul class="items" :class="wrapperClass">
      <slot></slot>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'AnalyticsList',
  props: {
    headerComponent: {
      type: String as PropType<'h1' | 'h2'>,
      default: 'h1'
    },
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
