<template>
  <div class="review-statement">
    <h3 class="title">
      <slot name="title">{{ title }}</slot>
    </h3>
    <p class="description">
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ReviewStatement',
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
