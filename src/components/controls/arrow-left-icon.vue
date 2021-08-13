<template>
  <svg
    :fill="fill"
    height="18"
    viewBox="0 0 11 18"
    width="11"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.6109 9.11046L9.49999 15.4995"
      :stroke="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
    />
    <path
      d="M9.49994 2.50142L1.61085 8.89051"
      :stroke="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
    />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ArrowLeftIcon',
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
