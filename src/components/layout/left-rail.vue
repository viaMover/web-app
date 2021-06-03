<template>
  <div class="left rail">
    <img alt="logo" class="logo" src="@/assets/images/logo.svg" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'LeftRail'
});
</script>
