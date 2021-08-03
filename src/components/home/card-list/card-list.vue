<template>
  <ul :class="wrapperClass">
    <slot></slot>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CardList',
  props: {
    wrapperClass: {
      type: String,
      default: ''
    }
  }
});
</script>
