<template>
  <ul class="nav-bar" :class="wrapperClass">
    <slot></slot>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NavBar',
  props: {
    wrapperClass: {
      type: String,
      default: ''
    }
  }
});
</script>
