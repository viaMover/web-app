<template>
  <li :class="wrapperClass">
    <div class="icon">{{ icon }}</div>
    <div class="text">{{ text }}</div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MenuListIconItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    wrapperClass: {
      type: String,
      default: ''
    }
  }
});
</script>
