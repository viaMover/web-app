<template>
  <div class="info__wrapper-sidebar" :class="[containerClass]">
    <router-link v-if="showLogo" class="logo" :to="{ name: 'home' }">
      <img alt="logo" src="@/assets/images/logo.svg" />
    </router-link>
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
    },
    showLogo: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    contentWrapperClass(): string {
      return `${this.containerClass}-wrapper`;
    }
  }
});
</script>
