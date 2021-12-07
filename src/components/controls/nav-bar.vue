<template>
  <nav class="nav-bar">
    <ul class="items">
      <slot></slot>
    </ul>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NavBar'
});
</script>
