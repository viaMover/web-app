<template>
  <router-link class="button" :to="{ name: navigateToName }">
    <slot></slot>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'HeadingNavButton',
  props: {
    buttonClass: {
      type: String,
      required: false,
      default: 'transparent'
    },
    navigateToName: {
      type: String,
      required: false
    }
  }
});
</script>
