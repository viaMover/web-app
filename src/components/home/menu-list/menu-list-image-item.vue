<template>
  <li :class="wrapperClass" :style="itemStyle">
    <img class="image" :src="image" />
    <div class="wrapper">
      <div class="title">{{ title }}</div>
      <div class="value">{{ description }}</div>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MenuListImageItem',
  props: {
    image: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
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
