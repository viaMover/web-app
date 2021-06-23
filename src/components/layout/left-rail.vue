<template>
  <div :class="[containerClass]">
    <a class="logo" href="#">
      <img alt="logo" src="@/assets/images/logo.svg" />
    </a>
    <div class="sidebar-wrapper">
      <div :class="contentWrapperClass">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'LeftRail',
  props: {
    containerClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    contentWrapperClass(): string {
      return `${this.containerClass}-wrapper`;
    }
  }
});
</script>
