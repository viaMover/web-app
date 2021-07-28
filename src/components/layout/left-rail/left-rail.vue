<template>
  <div class="info__wrapper-sidebar" :class="[containerClass]">
    <div class="sidebar-wrapper">
      <div :class="[contentWrapperClass, innerWrapperClass]">
        <slot></slot>
      </div>
      <router-link
        v-if="showLogo"
        class="logo button-active"
        :to="{ name: 'home' }"
      >
        <img alt="logo" src="@/assets/images/logo.svg" />
      </router-link>
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
      required: true
    },
    showLogo: {
      type: Boolean,
      required: true
    },
    innerWrapperClass: {
      type: String,
      required: true
    }
  },
  computed: {
    contentWrapperClass(): string {
      return `${this.containerClass}-wrapper`;
    }
  }
});
</script>
