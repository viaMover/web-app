<template>
  <svg
    :fill="fill"
    height="7"
    viewBox="0 0 12 7"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 1L6 6L1 1"
      :stroke="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ArrowDownIcon',
  props: {
    stroke: {
      type: String,
      default: '#000000'
    },
    fill: {
      type: String,
      default: 'none'
    }
  }
});
</script>
