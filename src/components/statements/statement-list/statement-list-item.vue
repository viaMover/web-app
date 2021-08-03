<template>
  <li>
    <p class="description">
      <slot name="description">{{ description }}</slot>
    </p>
    <span class="value">
      <slot>{{ value }}</slot>
    </span>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'StatementListItem',
  props: {
    description: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
    }
  }
});
</script>
