<template>
  <li class="item">
    <h3 class="title" :class="titleClass">
      <slot name="description">{{ title }}</slot>
    </h3>
    <div class="description" :class="descriptionClass">
      <slot>{{ description }}</slot>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AnalyticsListItem',
  props: {
    title: {
      type: String,
      default: undefined
    },
    titleClass: {
      type: String,
      default: undefined
    },
    description: {
      type: [String, Number],
      default: undefined
    },
    descriptionClass: {
      type: String,
      default: undefined
    }
  }
});
</script>
