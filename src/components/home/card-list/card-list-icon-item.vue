<template>
  <li :class="wrapperClass">
    <img :src="icon" />
    <div>{{ text }}</div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CardListIconItem',
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
