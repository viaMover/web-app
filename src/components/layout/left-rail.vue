<template>
  <div class="left rail">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'LeftRail'
});
</script>
