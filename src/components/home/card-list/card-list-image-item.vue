<template>
  <li :class="wrapperClass" :style="itemStyle">
    <img :src="image" />
    <div>{{ title }}</div>
    <div>{{ value }}</div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CardListImageItem',
  props: {
    image: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    itemStyle(): Record<string, string> {
      return {
        opacity: this.disabled ? '0.5' : '1'
      };
    }
  }
});
</script>
