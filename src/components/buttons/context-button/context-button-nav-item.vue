<template>
  <li>
    <router-link :to="{ name: navigateToName }">
      <slot>{{ text }}</slot>
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ContextButtonNavItem',
  props: {
    navigateToName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      default: ''
    }
  }
});
</script>
