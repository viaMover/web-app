<template>
  <li class="button-active">
    <router-link :to="navigateTo">
      <slot>{{ text }}</slot>
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NavBarItem',
  props: {
    text: {
      type: String,
      default: ''
    },
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
