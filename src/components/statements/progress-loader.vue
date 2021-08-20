<template>
  <svg class="donut" height="100%" viewBox="0 0 36 36" width="100%">
    <circle
      class="donut-ring"
      cx="18"
      cy="18"
      fill="transparent"
      r="15.91549430918954"
      stroke="#000"
      stroke-width="2"
    ></circle>
    <circle
      class="donut-segment"
      cx="18"
      cy="18"
      fill="transparent"
      r="15.91549430918954"
      stroke="#fafafc"
      :stroke-dasharray="dashArray"
      :stroke-dashoffset="dashOffset"
      stroke-width="3"
    ></circle>
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'ProgressLoader',
  props: {
    value: {
      type: Number,
      default: 0
    }
  },
  computed: {
    dashArray(): string {
      return `${String(100 - this.value)} ${String(this.value)}`;
    },
    dashOffset(): string {
      return String(25 - this.value);
    }
  }
});
</script>
