<template>
  <svg
    height="16px"
    version="1.1"
    viewBox="0 0 16 16"
    width="16px"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      id="svg-vertical-line"
      height="16"
      opacity="0"
      width="16"
      x="0"
      y="0"
    />
    <path
      id="svg-horizontal-line"
      d="M0,8 L16,8 M8,0 L8,16"
      :fill="fill"
      :stroke="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'PlusIcon',
  props: {
    stroke: {
      type: String,
      default: '#000000'
    },
    fill: {
      type: String,
      default: '#000000'
    }
  }
});
</script>
