<template>
  <div class="page-content">
    <div class="g-wrapper">
      <div :class="[contentWrapperClass]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'PageContainer',
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
