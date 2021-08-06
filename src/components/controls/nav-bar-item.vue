<template>
  <li class="button-active">
    <router-link :to="{ name: this.navigateToName }">
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
      required: true
    }
  }
});
</script>
