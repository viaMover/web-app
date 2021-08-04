<template>
  <li>
    <router-link :to="navigateTo">
      <slot></slot>
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NavBarItem',
  props: {
    navigateToName: {
      type: String,
      default: ''
    }
  },
  computed: {
    navigateTo(): Record<string, string> {
      return { name: this.navigateToName };
    }
  }
});
</script>
